import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/context/AuthContext'

const RedirectToLogin = () => {
    const navigate = useNavigate()
    const { isAuthenticated, loading } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                navigate('/chatflows')
            } else {
                navigate('/login')
            }
        }
    }, [isAuthenticated, loading, navigate])

    return null
}

export default RedirectToLogin