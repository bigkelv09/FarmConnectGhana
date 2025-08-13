import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
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
      
      const user = await storage.getUserByEmail(email);
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
      
      const user = await storage.getUser(req.user.id);
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
      const products = await storage.getProducts({
        category: category as string,
        search: search as string,
        sellerId: sellerId as string,
      });
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Get featured products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get seller info
      const seller = await storage.getUser(product.sellerId);
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
      
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(req.user.id, productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updates = req.body;
      const product = await storage.updateProduct(req.params.id, req.user.id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found or access denied" });
      }
      
      res.json(product);
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
      
      const success = await storage.deleteProduct(req.params.id, req.user.id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found or access denied" });
      }
      
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
        rainfall: 0, // Mock rainfall data
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
      
      const messages = await storage.getMessages(req.user.id);
      res.json(messages);
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
      const message = await storage.createMessage(req.user.id, messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const allUsers = Array.from(storage['users'].values());
      const allProducts = Array.from(storage['products'].values());
      
      res.json({
        users: allUsers.length,
        products: allProducts.filter(p => p.active).length,
        transactions: 8750, // Mock data
        regions: 16 // Ghana has 16 regions
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
