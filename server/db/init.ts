import { sql } from "drizzle-orm";
import { db } from "./index";

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables...");

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        location TEXT,
        phone TEXT,
        verified BOOLEAN DEFAULT false,
        rating DECIMAL(3,2) DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        joined_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create products table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        image_url TEXT,
        seller_id UUID REFERENCES users(id) NOT NULL,
        stock INTEGER DEFAULT 0,
        location TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Migration: Add quantity column if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;
      `);
      console.log("Migration: Added quantity column to products table");
    } catch (error) {
      console.log("Quantity column already exists or migration failed:", error);
    }

    // Migration: Add unit column if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT '';
      `);
      console.log("Migration: Added unit column to products table");
    } catch (error) {
      console.log("Unit column already exists or migration failed:", error);
    }

    // Create messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) NOT NULL,
        receiver_id UUID REFERENCES users(id) NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database tables initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    // Don't throw error - let the app continue if tables already exist
  }
}
