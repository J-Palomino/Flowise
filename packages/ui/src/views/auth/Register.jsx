import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, Alert } from '@mui/material'
import { useAuth } from '@/store/context/AuthContext'

const Register = () => {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        
        setLoading(true)

        try {
            const result = await register(name, email, password)
            
            if (result.success) {
                // Redirect to login page
                navigate('/login', { state: { message: 'Registration successful! Please login.' } })
            } else {
                setError(result.error || 'Failed to register. Please try again.')
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
            console.error('Registration error:', err)
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
                            Create an Account
                        </Typography>
                    </Box>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleRegister}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
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
                        <TextField
                            label="Confirm Password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

export default Register