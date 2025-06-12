import { Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    // For testing, always render the child routes
    return <Outlet />
}

export default ProtectedRoute