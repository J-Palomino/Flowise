import axios from 'axios'

export const setupAxiosInterceptors = () => {
    // Add a request interceptor
    axios.interceptors.request.use(
        (config) => {
            // Get the token from localStorage
            const token = localStorage.getItem('token')
            
            // If token exists, add it to the Authorization header
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Add a response interceptor
    axios.interceptors.response.use(
        (response) => {
            return response
        },
        (error) => {
            // Handle 401 Unauthorized errors
            if (error.response && error.response.status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                
                // Only redirect if not already on login or register page
                const currentPath = window.location.pathname
                if (currentPath !== '/login' && currentPath !== '/register') {
                    window.location.href = '/login'
                }
            }
            
            return Promise.reject(error)
        }
    )
}