import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Alert } from '@mui/material'
import { SignIn } from '@clerk/clerk-react'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const message = location.state?.message || ''

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: (theme) => theme.palette.background.default
            }}
        >
            <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 5 }}>
                <CardContent sx={{ padding: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <img src="/daisy.png" alt="Logo" style={{ height: 60 }} />
                        <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                            Login to Flowise
                        </Typography>
                    </Box>
                    
                    {message && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {message}
                        </Alert>
                    )}
                    
                    <SignIn 
                        routing="path" 
                        path="/login" 
                        signUpUrl="/register"
                        redirectUrl="/chatflows"
                    />
                </CardContent>
            </Card>
        </Box>
    )
}

export default Login