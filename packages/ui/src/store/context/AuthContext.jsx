import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { baseURL } from '@/store/constant'
import api from '@/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (token && storedUser) {
            // Set the authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(JSON.parse(storedUser))
        }
        
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await api.auth.login(email, password)
            
            const { token, user } = response
            
            // Store token and user in localStorage
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            
            // Set the authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            setUser(user)
            return { success: true }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Failed to login'
            }
        }
    }

    const register = async (name, email, password) => {
        try {
            await api.auth.register(name, email, password)
            
            return { success: true }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Failed to register'
            }
        }
    }

    const logout = async () => {
        try {
            // Call logout API
            await api.auth.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear local storage and state
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete axios.defaults.headers.common['Authorization']
            setUser(null)
            navigate('/login')
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext