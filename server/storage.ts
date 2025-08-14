import { type User, type InsertUser, type Product, type InsertProduct, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "node:crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getTrustedSellers(limit?: number): Promise<User[]>;

  // Product operations
  getProducts(filters?: { category?: string; search?: string; sellerId?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(sellerId: string, product: InsertProduct): Promise<Product>;
  updateProduct(id: string, sellerId: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string, sellerId: string): Promise<boolean>;
  getFeaturedProducts(): Promise<Product[]>;
  getLatestProducts(limit?: number): Promise<Product[]>;

  // Message operations
  getMessages(userId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(senderId: string, message: InsertMessage): Promise<Message>;
  markMessageRead(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.messages = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users
    const farmers = [
      {
        id: "farmer1",
        email: "kwame@example.com",
        password: "$2b$10$hash1", // In real app, properly hash passwords
        firstName: "Kwame",
        lastName: "Asante",
        accountType: "farmer" as const,
        location: "Kumasi, Ashanti Region",
        phone: "+233 24 123 4567",
        verified: true,
        createdAt: new Date(),
      },
      {
        id: "farmer2",
        email: "akosua@example.com",
        password: "$2b$10$hash2",
        firstName: "Akosua",
        lastName: "Mensah",
        accountType: "farmer" as const,
        location: "Accra, Greater Accra",
        phone: "+233 24 234 5678",
        verified: true,
        createdAt: new Date(),
      }
    ];
    
    farmers.forEach(user => this.users.set(user.id, user));

    // Sample products
    const sampleProducts = [
      {
        id: "prod1",
        sellerId: "farmer1",
        name: "Premium Tomatoes",
        description: "Fresh, organic tomatoes from Ashanti region farms. Perfect for cooking and salads.",
        category: "crops" as const,
        price: "45.00",
        unit: "kg",
        quantity: 100,
        location: "Kumasi",
        imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
        featured: true,
        active: true,
        createdAt: new Date(),
      },
      {
        id: "prod2",
        sellerId: "farmer2",
        name: "Small Tractor",
        description: "Reliable 25HP tractor perfect for small to medium farms. Well maintained.",
        category: "tools" as const,
        price: "48000.00",
        unit: "unit",
        quantity: 1,
        location: "Accra",
        imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
        featured: true,
        active: true,
        createdAt: new Date(),
      },
      {
        id: "prod3",
        sellerId: "farmer1",
        name: "Organic Fertilizer",
        description: "100% organic fertilizer made from compost. Great for all crop types.",
        category: "medications" as const,
        price: "25.00",
        unit: "bag",
        quantity: 50,
        location: "Kumasi",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        featured: false,
        active: true,
        createdAt: new Date(),
      }
    ];
    
    sampleProducts.forEach(product => this.products.set(product.id, product));

    // Sample messages
    const sampleMessages = [
      {
        id: "msg1",
        senderId: "farmer2",
        receiverId: "farmer1",
        productId: "prod1",
        content: "Hi, I'm interested in your tomatoes. Are they still available?",
        read: false,
        createdAt: new Date(),
      }
    ];

    sampleMessages.forEach(message => this.messages.set(message.id, message));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      verified: false,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTrustedSellers(limit?: number): Promise<User[]> {
    const trustedSellers = Array.from(this.users.values())
      .filter(user => user.accountType === "farmer" && user.verified)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return limit ? trustedSellers.slice(0, limit) : trustedSellers;
  }

  // Product operations
  async getProducts(filters?: { category?: string; search?: string; sellerId?: string }): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.active);
    
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    
    if (filters?.sellerId) {
      products = products.filter(p => p.sellerId === filters.sellerId);
    }
    
    return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product?.active ? product : undefined;
  }

  async createProduct(sellerId: string, product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: randomUUID(),
      sellerId,
      ...product,
      featured: false,
      active: true,
      createdAt: new Date(),
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, sellerId: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product || product.sellerId !== sellerId) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string, sellerId: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product || product.sellerId !== sellerId) return false;
    
    // Soft delete - mark as inactive
    const updatedProduct = { ...product, active: false };
    this.products.set(id, updatedProduct);
    return true;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.active && p.featured)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestProducts(limit?: number): Promise<Product[]> {
    const latestProducts = Array.from(this.products.values())
      .filter(p => p.active)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? latestProducts.slice(0, limit) : latestProducts;
  }

  // Message operations
  async getMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(senderId: string, message: InsertMessage): Promise<Message> {
    const newMessage: Message = {
      id: randomUUID(),
      senderId,
      ...message,
      read: false,
      createdAt: new Date(),
    };
    this.messages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async markMessageRead(id: string, userId: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message || message.receiverId !== userId) return false;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return true;
  }
}

export const storage = new MemStorage();
