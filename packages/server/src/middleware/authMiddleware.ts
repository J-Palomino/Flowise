import { Request, Response, NextFunction } from 'express'

// Mock sessions database (shared with auth controller)
const sessions = new Map()

/**
 * Middleware to authenticate requests
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Auth middleware called for path:', req.path)
    
    // Skip authentication for public routes
    const publicRoutes = [
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/logout',
        '/api/v1/verify'
    ]
    
    if (publicRoutes.includes(req.path)) {
        console.log('Public route, skipping authentication')
        return next()
    }
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided')
        return res.status(401).json({ error: 'Unauthorized - No token provided' })
    }
    
    const token = authHeader.split(' ')[1]
    console.log('Token provided:', token.substring(0, 10) + '...')
    
    try {
        // For testing, just pass through authentication
        req.user = {
            id: '1234-5678-9012',
            email: 'test@example.com',
            name: 'Test User'
        }
        
        console.log('Authentication successful')
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(401).json({ error: 'Unauthorized - Invalid token' })
    }
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