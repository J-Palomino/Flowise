import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { IAuthService } from '../Interface'

export const authRoutes = (authService: IAuthService) => {
    const router = express.Router()

    // Middleware to validate token
    const authenticateToken = async (req: Request, res: Response, next: any) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        try {
            const userData = await authService.verifyToken(token)
            req.body.user = userData.user
            next()
        } catch (error) {
            return res.status(403).send({ message: 'Invalid or expired token' })
        }
    }

    // Sign up route
    router.post(
        '/signup',
        [
            body('email').isEmail().withMessage('Email must be valid'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        ],
        async (req: Request, res: Response) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { email, password, firstName, lastName } = req.body

            try {
                const result = await authService.signUp(email, password, firstName, lastName)
                return res.status(201).send(result)
            } catch (error: any) {
                console.error('Error in signup route:', error)
                return res.status(500).send({ message: error.message || 'Error creating user' })
            }
        }
    )

    // Sign in route
    router.post(
        '/signin',
        [
            body('email').isEmail().withMessage('Email must be valid'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        ],
        async (req: Request, res: Response) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { email, password } = req.body

            try {
                const result = await authService.signIn(email, password)
                return res.status(200).send(result)
            } catch (error: any) {
                console.error('Error in signin route:', error)
                return res.status(401).send({ message: error.message || 'Invalid credentials' })
            }
        }
    )

    // Sign out route
    router.post('/signout', authenticateToken, async (req: Request, res: Response) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        try {
            await authService.signOut(token)
            return res.status(200).send({ message: 'Signed out successfully' })
        } catch (error: any) {
            console.error('Error in signout route:', error)
            return res.status(500).send({ message: error.message || 'Error signing out' })
        }
    })

    // Get user profile
    router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { user } = req.body
            return res.status(200).send(user)
        } catch (error: any) {
            console.error('Error in profile route:', error)
            return res.status(500).send({ message: error.message || 'Error getting user profile' })
        }
    })

    // Get user credits
    router.get('/credits', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { user } = req.body
            const userData = await authService.getUserById(user.id)
            return res.status(200).send({ credits: userData.credits, plan: userData.plan })
        } catch (error: any) {
            console.error('Error in credits route:', error)
            return res.status(500).send({ message: error.message || 'Error getting user credits' })
        }
    })

    return router
}