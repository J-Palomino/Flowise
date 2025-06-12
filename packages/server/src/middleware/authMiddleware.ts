import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to authenticate requests
 * For testing, this middleware always allows access
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Auth middleware called for path:', req.path)
    
    // For testing, always set a test user
    req.user = {
        id: '1234-5678-9012',
        email: 'test@example.com',
        name: 'Test User'
    }
    
    console.log('Authentication successful (test mode)')
    next()
}

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - No user data' })
    }
    
    // For testing, just allow admin access
    next()
}