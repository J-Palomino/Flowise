import axios from 'axios'
import { baseURL } from '@/store/constant'

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${baseURL}/api/v1/auth/login`, {
            email,
            password
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const register = async (name, email, password) => {
    try {
        const response = await axios.post(`${baseURL}/api/v1/auth/register`, {
            name,
            email,
            password
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const logout = async () => {
    try {
        const response = await axios.post(`${baseURL}/api/v1/auth/logout`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const getProfile = async () => {
    try {
        const response = await axios.get(`${baseURL}/api/v1/auth/profile`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const updateProfile = async (data) => {
    try {
        const response = await axios.put(`${baseURL}/api/v1/auth/profile`, data)
        return response.data
    } catch (error) {
        throw error
    }
}