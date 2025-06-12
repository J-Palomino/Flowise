import { Navigate, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react'
import { CircularProgress, Box } from '@mui/material'

const ProtectedRoute = () => {
    const { session } = useClerk()
    
    return (
        <>
            <SignedIn>
                <Outlet />
            </SignedIn>
            <SignedOut>
                <Navigate to="/login" replace />
            </SignedOut>
        </>
    )
}

export default ProtectedRoute