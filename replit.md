# Overview

This is a full-stack agricultural marketplace web application built with React, Express, and PostgreSQL. The platform connects farmers and buyers in Ghana, enabling direct trade of agricultural products, tools, and fertilizers. The application features user authentication, product listings, messaging capabilities, and weather integration to help farmers make informed decisions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom agricultural color scheme (forest green, harvest orange, etc.)

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Custom logging, JSON parsing, and JWT authentication
- **Error Handling**: Centralized error handling with status codes and structured responses

## Database & ORM
- **Database**: PostgreSQL with Neon Database serverless connection
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema**: Shared schema definitions between client and server using Drizzle-Zod
- **Migrations**: Drizzle Kit for database migrations and schema management

## Authentication & Security
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Session Management**: Token storage in localStorage with automatic header injection
- **Authorization**: Route-level protection with middleware authentication
- **Password Security**: Bcrypt with salt rounds for secure password storage

## Data Storage Strategy
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: PostgreSQL with connection pooling via Neon Database
- **Schema Design**: Users (farmers/buyers), Products (crops/tools/medications), Messages for communication
- **Data Validation**: Zod schemas for runtime type checking and validation

## Key Features Implementation
- **User Roles**: Farmer and buyer account types with role-based functionality
- **Product Management**: CRUD operations for agricultural products with categories
- **Messaging System**: Direct communication between buyers and sellers
- **Search & Filtering**: Product search with category and price filtering
- **Weather Integration**: OpenWeather API integration for agricultural insights
- **Responsive Design**: Mobile-first design with agricultural theme

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations

## Authentication & Security
- **bcrypt**: Password hashing and salt generation
- **jsonwebtoken**: JWT token generation and verification

## Weather Services
- **OpenWeather API**: Real-time weather data for agricultural decision-making
- Fallback to mock data when API is unavailable

## Frontend Libraries
- **Radix UI**: Accessible component primitives for form controls and overlays
- **Tailwind CSS**: Utility-first CSS framework with custom agricultural design tokens
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation integration
- **Zod**: Runtime type validation for forms and API responses

## Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimization for Replit platform