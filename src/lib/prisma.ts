import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client Configuration
 * 
 * This module provides a singleton Prisma client instance for database operations.
 * It ensures that only one database connection is maintained across the application
 * to prevent connection pool exhaustion in serverless environments.
 * 
 * In development, the client is attached to the global object to persist
 * across hot reloads and avoid connection issues.
 */

// Extend global namespace to include Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma client instance
 * - Reuses existing global instance in development to prevent multiple connections
 * - Creates new instance in production for each deployment
 */
export const prisma = global.prisma || new PrismaClient();

// In development, store the client globally to persist across hot reloads
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
