import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography
} from '@mui/material'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import axios from 'axios'
import { baseURL } from '../../store/constant'

// assets
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

// ============================|| REGISTER ||============================ //

const Register = () => {
    const navigate = useNavigate()

    const [values, setValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState(null)

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value })
        // Clear error when user types
        if (errors[prop]) {
            setErrors({ ...errors, [prop]: null })
        }
    }

    const handleClickShowPassword = (prop) => () => {
        setValues({
            ...values,
            [prop]: !values[prop]
        })
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const validateForm = () => {
        const newErrors = {}

        if (!values.firstName) newErrors.firstName = 'First name is required'
        if (!values.lastName) newErrors.lastName = 'Last name is required'
        if (!values.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!values.password) {
            newErrors.password = 'Password is required'
        } else if (values.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        if (values.password !== values.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleRegister = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        setApiError(null)

        try {
            await axios.post(`${baseURL}/api/v1/auth/signup`, {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password
            })

            // Registration successful, redirect to login
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } })
        } catch (err) {
            console.error('Registration error:', err)
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
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
                                Sign up
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontSize="16px" textAlign="center">
                                Enter your credentials to continue
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <form noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="firstName-signup">First Name*</InputLabel>
                                    <OutlinedInput
                                        id="firstName-signup"
                                        type="text"
                                        value={values.firstName}
                                        name="firstName"
                                        onChange={handleChange('firstName')}
                                        placeholder="John"
                                        fullWidth
                                        error={Boolean(errors.firstName)}
                                    />
                                    {errors.firstName && (
                                        <FormHelperText error id="helper-text-firstName-signup">
                                            {errors.firstName}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="lastName-signup">Last Name*</InputLabel>
                                    <OutlinedInput
                                        id="lastName-signup"
                                        type="text"
                                        value={values.lastName}
                                        name="lastName"
                                        onChange={handleChange('lastName')}
                                        placeholder="Doe"
                                        fullWidth
                                        error={Boolean(errors.lastName)}
                                    />
                                    {errors.lastName && (
                                        <FormHelperText error id="helper-text-lastName-signup">
                                            {errors.lastName}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                                    <OutlinedInput
                                        id="email-signup"
                                        type="email"
                                        value={values.email}
                                        name="email"
                                        onChange={handleChange('email')}
                                        placeholder="john.doe@example.com"
                                        fullWidth
                                        error={Boolean(errors.email)}
                                    />
                                    {errors.email && (
                                        <FormHelperText error id="helper-text-email-signup">
                                            {errors.email}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="password-signup">Password*</InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        id="password-signup"
                                        type={values.showPassword ? 'text' : 'password'}
                                        value={values.password}
                                        name="password"
                                        onChange={handleChange('password')}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword('showPassword')}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="large"
                                                >
                                                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        placeholder="******"
                                        error={Boolean(errors.password)}
                                    />
                                    {errors.password && (
                                        <FormHelperText error id="helper-text-password-signup">
                                            {errors.password}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="confirm-password-signup">Confirm Password*</InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        id="confirm-password-signup"
                                        type={values.showConfirmPassword ? 'text' : 'password'}
                                        value={values.confirmPassword}
                                        name="confirmPassword"
                                        onChange={handleChange('confirmPassword')}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword('showConfirmPassword')}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="large"
                                                >
                                                    {values.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        placeholder="******"
                                        error={Boolean(errors.confirmPassword)}
                                    />
                                    {errors.confirmPassword && (
                                        <FormHelperText error id="helper-text-confirm-password-signup">
                                            {errors.confirmPassword}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>

                            {apiError && (
                                <Grid item xs={12}>
                                    <FormHelperText error>{apiError}</FormHelperText>
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
                                    onClick={handleRegister}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid item container direction="column" alignItems="center" xs={12}>
                                    <Typography
                                        component="span"
                                        variant="subtitle1"
                                        sx={{ textDecoration: 'none', cursor: 'pointer' }}
                                        onClick={() => navigate('/login')}
                                    >
                                        Already have an account?
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

export default Register