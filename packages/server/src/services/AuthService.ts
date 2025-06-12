// import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getDataSource } from '../DataSource'
import { User } from '../database/entities/User'
import crypto from 'crypto'

// Mock implementation for testing
export class AuthService {
    private users: Map<string, any> = new Map()
    private sessions: Map<string, any> = new Map()
    
    constructor() {
        // Add a default test user
        const testUserId = '1234-5678-9012'
        this.users.set('test@example.com', {
            id: testUserId,
            email: 'test@example.com',
            password: this.hashPassword('password123'),
            user_metadata: {
                name: 'Test User'
            }
        })
        
        // Create user in database
        this.createUserInDatabase(testUserId, 'test@example.com', 'Test User')
            .catch(err => console.error('Failed to create test user:', err))
    }
    
    private hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex')
    }
    
    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex')
    }
    
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, name?: string): Promise<any> {
        // Check if user already exists
        if (this.users.has(email)) {
            throw new Error('User already exists')
        }
        
        const userId = crypto.randomUUID()
        const hashedPassword = this.hashPassword(password)
        
        const user = {
            id: userId,
            email,
            password: hashedPassword,
            user_metadata: {
                name: name || ''
            }
        }
        
        this.users.set(email, user)
        
        // Create user in our database
        await this.createUserInDatabase(userId, email, name)
        
        return {
            user: {
                id: userId,
                email,
                user_metadata: {
                    name: name || ''
                }
            }
        }
    }
    
    /**
     * Sign in a user
     */
    async signIn(email: string, password: string): Promise<any> {
        const user = this.users.get(email)
        
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid credentials')
        }
        
        const token = this.generateToken()
        const session = {
            access_token: token,
            user_id: user.id,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
        
        this.sessions.set(token, session)
        
        // Ensure user exists in our database
        const userExists = await this.getUserById(user.id)
        if (!userExists) {
            await this.createUserInDatabase(user.id, email, user.user_metadata?.name)
        }
        
        return {
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
            },
            session
        }
    }
    
    /**
     * Sign out a user
     */
    async signOut(token: string): Promise<void> {
        this.sessions.delete(token)
    }
    
    /**
     * Verify a token
     */
    async verifyToken(token: string): Promise<any> {
        const session = this.sessions.get(token)
        
        if (!session) {
            throw new Error('Invalid token')
        }
        
        if (new Date(session.expires_at) < new Date()) {
            this.sessions.delete(token)
            throw new Error('Token expired')
        }
        
        const user = Array.from(this.users.values()).find(u => u.id === session.user_id)
        
        if (!user) {
            throw new Error('User not found')
        }
        
        return {
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
            }
        }
    }
    
    /**
     * Create a user in our database
     */
    private async createUserInDatabase(id: string, email: string, name?: string): Promise<User> {
        const dataSource = getDataSource()
        const userRepository = dataSource.getRepository(User)
        
        // Check if user already exists
        let user = await userRepository.findOne({ where: { id } })
        if (user) return user
        
        // Create new user
        user = new User()
        user.id = id
        user.email = email
        user.name = name || ''
        
        return await userRepository.save(user)
    }
    
    /**
     * Get a user by ID
     */
    async getUserById(id: string): Promise<User | null> {
        const dataSource = getDataSource()
        const userRepository = dataSource.getRepository(User)
        return await userRepository.findOne({ where: { id } })
    }
    
    /**
     * Get a user by email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        const dataSource = getDataSource()
        const userRepository = dataSource.getRepository(User)
        return await userRepository.findOne({ where: { email } })
    }
}