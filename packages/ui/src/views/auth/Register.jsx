import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { SignUp } from '@clerk/clerk-react'

const Register = () => {
    const navigate = useNavigate()

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
                            Create an Account
                        </Typography>
                    </Box>
                    
                    <SignUp 
                        routing="path" 
                        path="/register" 
                        signInUrl="/login"
                        redirectUrl="/chatflows"
                    />
                </CardContent>
            </Card>
        </Box>
    )
}

export default Register