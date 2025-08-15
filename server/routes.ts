import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, products, messages } from "./db/schema";
import { insertUserSchema } from "./db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Custom validation schema for API endpoints
const apiProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  location: z.string(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).optional(),
});

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: jwt.JsonWebTokenError | null, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user as { id: string; email: string };
    next();
  });
}

// Weather API integration
async function getWeatherData(location: string = "Accra") {
  const API_KEY = process.env.OPENWEATHER_API_KEY || "demo_key";
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location},GH&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error('Weather API failed');
    }
    return await response.json();
  } catch (error) {
    // Return mock data if API fails
    return {
      main: { temp: 28, humidity: 72 },
      weather: [{ main: "Clear", description: "sunny" }],
      wind: { speed: 4.2 }
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const [user] = await db.insert(users).values({
        ...userData,
        password: hashedPassword,
      }).returning();

      // Create JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sellerId } = req.query;
      const productsList = await db.query.products.findMany({
        where: and(
          category ? eq(products.category, category as string) : undefined,
          search ? ilike(products.name, `%${search}%`) : undefined,
          sellerId ? eq(products.sellerId, sellerId as string) : undefined
        ),
      });
      
      res.json(productsList);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const productsList = await db.query.products.findMany({
        where: eq(products.featured, true),
      });
      res.json(productsList);
    } catch (error) {
      console.error("Get featured products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const productsList = await db.query.products.findMany({
        orderBy: desc(products.createdAt),
        take: limit,
      });
      res.json(productsList);
    } catch (error) {
      console.error("Get latest products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.id, req.params.id),
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get seller info
      const seller = await db.query.users.findFirst({
        where: eq(users.id, product.sellerId),
      });
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      const { password, ...sellerInfo } = seller;
      res.json({ ...product, seller: sellerInfo });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      console.log("Raw request body:", req.body);
      console.log("User from token:", req.user);

      // Transform the data to match the schema before validation
      const requestData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: parseFloat(req.body.price),
        quantity: parseInt(req.body.quantity),
        unit: req.body.unit,
        location: req.body.location || '',
        imageUrl: req.body.imageUrl || '',
        stock: req.body.stock ? parseInt(req.body.stock) : 0,
      };

      console.log("Transformed data:", requestData);

      const productData = apiProductSchema.parse(requestData);
      const [product] = await db.insert(products).values({
        ...productData,
        sellerId: req.user.id,
      }).returning();
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updates = req.body;
      const product = await db.query.products.findFirst({
        where: eq(products.id, req.params.id),
      });

      if (!product || product.sellerId !== req.user.id) {
        return res.status(404).json({ message: "Product not found or access denied" });
      }
      
      const [updatedProduct] = await db.update(products)
        .set(updates)
        .where(eq(products.id, req.params.id))
        .returning();

      res.json(updatedProduct);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const product = await db.query.products.findFirst({
        where: eq(products.id, req.params.id),
      });

      if (!product || product.sellerId !== req.user.id) {
        return res.status(404).json({ message: "Product not found or access denied" });
      }
      
      await db.delete(products).where(eq(products.id, req.params.id));

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Weather route
  app.get("/api/weather", async (req, res) => {
    try {
      const location = req.query.location as string || "Accra";
      const weatherData = await getWeatherData(location);
      
      res.json({
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        rainfall: weatherData.rain ? Math.round(weatherData.rain['1h'] || 0) : 0, // Real rainfall data from API
      });
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Weather service unavailable" });
    }
  });

  // Message routes
  app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const messagesList = await db.query.messages.findMany({
        where: eq(messages.receiverId, req.user.id),
      });
      res.json(messagesList);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const messageData = insertMessageSchema.parse(req.body);
      const [message] = await db.insert(messages).values({
        ...messageData,
        senderId: req.user.id,
      }).returning();
      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany();
      const allProducts = await db.query.products.findMany();
      const allMessages = await db.query.messages.findMany();

      // Calculate actual transactions from messages (inquiries that led to communication)
      const uniqueConversations = new Set();
      allMessages.forEach(msg => {
        const conversationKey = [msg.senderId, msg.receiverId].sort().join('-');
        uniqueConversations.add(conversationKey);
      });

      res.json({
        users: allUsers.length,
        products: allProducts.filter(p => p.active).length,
        transactions: uniqueConversations.size, // Real conversation count as proxy for transactions
        regions: new Set(allUsers.map(u => u.location?.split(',').pop()?.trim()).filter(Boolean)).size // Count unique regions from user locations
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/trusted-sellers", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const sellers = await db.query.users.findMany({
        where: eq(users.verified, true),
        orderBy: desc(users.joinedAt),
        limit: limit,
      });
      const sellersWithoutPassword = sellers.map(({ password, ...seller }) => seller);
      res.json(sellersWithoutPassword);
    } catch (error) {
      console.error("Get trusted sellers error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
