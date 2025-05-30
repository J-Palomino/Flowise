import { Request, Response, NextFunction } from 'express'
import { IAuthService } from '../Interface'
import logger from '../utils/logger'

/**
 * Middleware to verify authentication token
 * @param authService
 */
export const verifyToken = (authService: IAuthService) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get token from header
            const token = req.headers.authorization?.split(' ')[1]

            if (!token) {
                return res.status(401).json({ message: 'No token provided' })
            }

            // Verify token
            const user = await authService.verifyToken(token)
            
            if (!user) {
                return res.status(401).json({ message: 'Invalid token' })
            }

            // Add user to request object
            req.user = user
            next()
        } catch (error) {
            logger.error('Authentication error:', error)
            return res.status(401).json({ message: 'Authentication failed' })
        }
    }
}

/**
 * Middleware to check if user has enough credits
 * @param authService
 * @param requiredCredits
 */
export const checkCredits = (authService: IAuthService, requiredCredits: number = 1) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'User not authenticated' })
            }

            const userCredits = await authService.getUserCredits(req.user.id)
            
            if (userCredits < requiredCredits) {
                return res.status(403).json({ 
                    message: 'Insufficient credits', 
                    required: requiredCredits,
                    available: userCredits
                })
            }

            next()
        } catch (error) {
            logger.error('Credit check error:', error)
            return res.status(500).json({ message: 'Error checking credits' })
        }
    }
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}