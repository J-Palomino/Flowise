import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, Alert } from '@mui/material'
import { useAuth } from '@/store/context/AuthContext'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const message = location.state?.message || ''

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(email, password)
            
            if (result.success) {
                // Redirect to dashboard
                navigate('/chatflows')
            } else {
                setError(result.error || 'Invalid email or password')
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
            console.error('Login error:', err)
        } finally {
            setLoading(false)
        }
    }

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
            <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 5 }}>
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
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleLogin}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </Button>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

export default Login