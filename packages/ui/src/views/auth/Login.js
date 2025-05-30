import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// material-ui
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography,
    Box
} from '@mui/material'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import { LOGIN } from '../../store/actions'
import axios from 'axios'
import { baseURL } from '../../store/constant'

// assets
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

// ============================|| LOGIN ||============================ //

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [checked, setChecked] = useState(true)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const [values, setValues] = useState({
        email: '',
        password: '',
        showPassword: false
    })

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value })
    }

    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword
        })
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleLogin = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post(`${baseURL}/api/v1/auth/signin`, {
                email: values.email,
                password: values.password
            })

            const { user, credits, plan, session } = response.data

            // Store token in localStorage
            localStorage.setItem('authToken', session.access_token)
            localStorage.setItem('refreshToken', session.refresh_token)
            localStorage.setItem('userInfo', JSON.stringify(user))
            localStorage.setItem('userCredits', credits)
            localStorage.setItem('userPlan', plan)

            dispatch({
                type: LOGIN,
                payload: {
                    isLoggedIn: true,
                    user,
                    credits,
                    plan
                }
            })

            navigate('/')
        } catch (err) {
            console.error('Login error:', err)
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = () => {
        navigate('/register')
    }

    return (
        <MainCard
            sx={{
                maxWidth: { xs: 400, lg: 475 },
                margin: { xs: 2.5, md: 3 },
                '& > *': {
                    flexGrow: 1,
                    flexBasis: '50%'
                }
            }}
            content={false}
        >
            <Grid container sx={{ p: 2 }}>
                <Grid item xs={12}>
                    <Grid container direction="column" justifyContent="center" spacing={2}>
                        <Grid item xs={12}>
                            <Typography color="secondary" gutterBottom variant="h2" align="center">
                                Sign in
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} container alignItems="center" justifyContent="center">
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">Sign in with Email address</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <form noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="email-login">Email Address</InputLabel>
                                    <OutlinedInput
                                        id="email-login"
                                        type="email"
                                        value={values.email}
                                        name="email"
                                        onChange={handleChange('email')}
                                        placeholder="Enter email address"
                                        fullWidth
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="password-login">Password</InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        id="password-login"
                                        type={values.showPassword ? 'text' : 'password'}
                                        value={values.password}
                                        name="password"
                                        onChange={handleChange('password')}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="large"
                                                >
                                                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        placeholder="Enter password"
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} sx={{ mt: -1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}
                                                onChange={(e) => setChecked(e.target.checked)}
                                                name="checked"
                                                color="primary"
                                            />
                                        }
                                        label="Remember me"
                                    />
                                </Stack>
                            </Grid>

                            {error && (
                                <Grid item xs={12}>
                                    <FormHelperText error>{error}</FormHelperText>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Button
                                    disableElevation
                                    disabled={isLoading}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleLogin}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid item container direction="column" alignItems="center" xs={12}>
                                    <Typography
                                        component="span"
                                        variant="subtitle1"
                                        sx={{ textDecoration: 'none', cursor: 'pointer' }}
                                        onClick={handleSignUp}
                                    >
                                        Don&apos;t have an account?
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        </MainCard>
    )
}

export default Login