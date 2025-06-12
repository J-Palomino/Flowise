import { Request, Response } from 'express'
import crypto from 'crypto'

// Mock user database
const users = new Map()
const sessions = new Map()

// Add a test user
const testUserId = '1234-5678-9012'
users.set('test@example.com', {
    id: testUserId,
    email: 'test@example.com',
    password: crypto.createHash('sha256').update('password123').digest('hex'),
    name: 'Test User',
    isAdmin: false
})

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
    console.log('Register endpoint called with body:', req.body)
    
    const { email, password, name } = req.body
    
    if (!email || !password) {
        console.log('Email or password missing')
        return res.status(400).json({ error: 'Email and password are required' })
    }
    
    try {
        console.log('Attempting to sign up user:', email)
        
        // Check if user already exists
        if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' })
        }
        
        const userId = crypto.randomUUID()
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
        
        // Store user
        users.set(email, {
            id: userId,
            email,
            password: hashedPassword,
            name: name || '',
            isAdmin: false
        })
        
        console.log('User registered successfully:', { id: userId, email, name })
        return res.status(201).json({ 
            message: 'User registered successfully',
            data: {
                user: {
                    id: userId,
                    email,
                    name: name || ''
                }
            }
        })
    } catch (error: any) {
        console.error('Registration error:', error)
        return res.status(500).json({ error: error.message || 'Failed to register user' })
    }
}

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
    console.log('Login endpoint called with body:', req.body)
    
    const { email, password } = req.body
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }
    
    try {
        const user = users.get(email)
        
        if (!user || user.password !== crypto.createHash('sha256').update(password).digest('hex')) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        
        // Generate token
        const token = crypto.randomBytes(32).toString('hex')
        
        // Store session
        sessions.set(token, {
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        })
        
        console.log('User logged in successfully:', { id: user.id, email: user.email })
        
        return res.status(200).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || ''
            }
        })
    } catch (error: any) {
        console.error('Login error:', error)
        return res.status(401).json({ error: error.message || 'Invalid credentials' })
    }
}

/**
 * Logout a user
 */
export const logout = async (req: Request, res: Response) => {
    console.log('Logout endpoint called')
    
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ error: 'No token provided' })
    }
    
    const token = authHeader.split(' ')[1]
    
    try {
        // Remove session
        sessions.delete(token)
        
        return res.status(200).json({ message: 'Logout successful' })
    } catch (error: any) {
        console.error('Logout error:', error)
        return res.status(500).json({ error: error.message || 'Failed to logout' })
    }
}

/**
 * Get current user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
    console.log('Get current user endpoint called')
    
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }
    
    try {
        // Find user by ID
        const user = Array.from(users.values()).find(u => u.id === req.user.id)
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        return res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
        })
    } catch (error: any) {
        console.error('Get current user error:', error)
        return res.status(500).json({ error: error.message || 'Failed to get user data' })
    }
}