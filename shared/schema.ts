import { z } from "zod";

// Simplified schemas for frontend validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  location: z.string().optional(),
  phone: z.string().optional(),
});

export const insertProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["crops", "livestock", "farm-tools", "seeds", "fertilizers"]),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative").optional(),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const insertMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1),
});

// Type exports
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location?: string;
  phone?: string;
  verified: boolean;
  rating: string;
  totalSales: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
  sellerId: string;
  stock?: number;
  location?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
