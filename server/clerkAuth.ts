import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  // No additional setup needed for Clerk middleware
  // Clerk handles authentication through middleware
}

// Middleware to require authentication
export const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('Auth error:', error);
  }
});

// Middleware that adds auth to request but doesn't require it
export const withAuth = ClerkExpressWithAuth({
  onError: (error) => {
    console.error('Auth error:', error);
  }
});

// Helper middleware to ensure user exists in database
export const ensureUser: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.auth.userId;
    let user = await storage.getUser(userId);
    
    if (!user) {
      // Create user if they don't exist
      const clerkUser = req.auth.user || {};
      user = await storage.upsertUser({
        id: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        profileImageUrl: clerkUser.imageUrl || null,
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error ensuring user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Combined middleware for authenticated routes
export const isAuthenticated: RequestHandler = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    ensureUser(req, res, next);
  });
};