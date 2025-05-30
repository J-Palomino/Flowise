import { createClient } from '@supabase/supabase-js'
import { DataSource, Repository } from 'typeorm'
import { User } from '../database/entities/User'
import { UserCredits } from '../database/entities/UserCredits'
import { IAuthService } from '../Interface'

export class AuthService implements IAuthService {
    private supabaseUrl: string
    private supabaseKey: string
    private supabaseClient: any
    private userRepository: Repository<User>
    private userCreditsRepository: Repository<UserCredits>

    constructor(dataSource: DataSource) {
        this.supabaseUrl = process.env.SUPABASE_URL || ''
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        
        if (this.supabaseUrl && this.supabaseKey) {
            this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey)
        }
        
        this.userRepository = dataSource.getRepository(User)
        this.userCreditsRepository = dataSource.getRepository(UserCredits)
    }

    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<any> {
        if (!this.supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        try {
            // Create user in Supabase
            const { data: authData, error: authError } = await this.supabaseClient.auth.signUp({
                email,
                password
            })

            if (authError) {
                throw authError
            }

            // Create user in our database
            const user = new User()
            user.id = authData.user.id
            user.email = email
            user.firstName = firstName || ''
            user.lastName = lastName || ''
            await this.userRepository.save(user)

            // Initialize user credits
            const userCredits = new UserCredits()
            userCredits.userId = user.id
            userCredits.credits = 100 // Default starting credits
            userCredits.plan = 'free'
            await this.userCreditsRepository.save(userCredits)

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                credits: userCredits.credits,
                plan: userCredits.plan
            }
        } catch (error) {
            console.error('Error signing up user:', error)
            throw error
        }
    }

    /**
     * Sign in a user
     */
    async signIn(email: string, password: string): Promise<any> {
        if (!this.supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        try {
            // Sign in with Supabase
            const { data: authData, error: authError } = await this.supabaseClient.auth.signInWithPassword({
                email,
                password
            })

            if (authError) {
                throw authError
            }

            // Get user from our database
            let user = await this.userRepository.findOne({ where: { id: authData.user.id } })

            // If user doesn't exist in our database, create it
            if (!user) {
                user = new User()
                user.id = authData.user.id
                user.email = email
                await this.userRepository.save(user)
            }

            // Update last login
            user.lastLogin = new Date()
            await this.userRepository.save(user)

            // Get user credits
            let userCredits = await this.userCreditsRepository.findOne({ where: { userId: user.id } })

            // If user credits don't exist, create them
            if (!userCredits) {
                userCredits = new UserCredits()
                userCredits.userId = user.id
                userCredits.credits = 100 // Default starting credits
                userCredits.plan = 'free'
                await this.userCreditsRepository.save(userCredits)
            }

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin
                },
                credits: userCredits.credits,
                plan: userCredits.plan,
                session: authData.session
            }
        } catch (error) {
            console.error('Error signing in user:', error)
            throw error
        }
    }

    /**
     * Sign out a user
     */
    async signOut(token: string): Promise<void> {
        if (!this.supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        try {
            await this.supabaseClient.auth.signOut()
        } catch (error) {
            console.error('Error signing out user:', error)
            throw error
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } })
            if (!user) {
                throw new Error('User not found')
            }

            const userCredits = await this.userCreditsRepository.findOne({ where: { userId } })

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin
                },
                credits: userCredits ? userCredits.credits : 0,
                plan: userCredits ? userCredits.plan : 'free'
            }
        } catch (error) {
            console.error('Error getting user by ID:', error)
            throw error
        }
    }

    /**
     * Get user credits
     */
    async getUserCredits(userId: string): Promise<number> {
        try {
            const userCredits = await this.userCreditsRepository.findOne({ where: { userId } })
            
            if (!userCredits) {
                // If no credits record exists, create one with default values
                const newUserCredits = new UserCredits()
                newUserCredits.userId = userId
                newUserCredits.credits = 100 // Default starting credits
                newUserCredits.plan = 'free'
                await this.userCreditsRepository.save(newUserCredits)
                return 100
            }
            
            return userCredits.credits
        } catch (error) {
            console.error('Error getting user credits:', error)
            throw error
        }
    }

    /**
     * Update user credits
     */
    async updateUserCredits(userId: string, credits: number): Promise<any> {
        try {
            let userCredits = await this.userCreditsRepository.findOne({ where: { userId } })

            if (!userCredits) {
                userCredits = new UserCredits()
                userCredits.userId = userId
                userCredits.credits = credits
                userCredits.plan = 'free'
            } else {
                userCredits.credits = credits
            }

            await this.userCreditsRepository.save(userCredits)

            return {
                userId,
                credits: userCredits.credits,
                plan: userCredits.plan
            }
        } catch (error) {
            console.error('Error updating user credits:', error)
            throw error
        }
    }

    /**
     * Verify token and get user
     */
    async verifyToken(token: string): Promise<any> {
        if (!this.supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        try {
            const { data, error } = await this.supabaseClient.auth.getUser(token)

            if (error) {
                throw error
            }

            return await this.getUserById(data.user.id)
        } catch (error) {
            console.error('Error verifying token:', error)
            throw error
        }
    }
}