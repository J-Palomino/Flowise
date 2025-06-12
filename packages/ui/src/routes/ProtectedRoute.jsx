import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/context/AuthContext'

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth()
    
    // If still loading, show nothing or a loading spinner
    if (loading) {
        return <div>Loading...</div>
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    
    // If authenticated, render the child routes
    return <Outlet />
}

export default ProtectedRoute