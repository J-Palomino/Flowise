import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Typography, Box, Chip, Tooltip } from '@mui/material'
import axios from 'axios'
import { baseURL } from '../store/constant'

const UserCredits = () => {
    const [credits, setCredits] = useState(null)
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { isLoggedIn } = useSelector((state) => state.auth)

    useEffect(() => {
        const fetchCredits = async () => {
            if (!isLoggedIn) {
                setLoading(false)
                return
            }

            try {
                const token = localStorage.getItem('authToken')
                if (!token) {
                    setLoading(false)
                    return
                }

                const response = await axios.get(`${baseURL}/api/v1/auth/credits`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setCredits(response.data.credits)
                setPlan(response.data.plan)
            } catch (err) {
                console.error('Error fetching credits:', err)
                setError('Failed to load credits')
            } finally {
                setLoading(false)
            }
        }

        fetchCredits()
    }, [isLoggedIn])

    if (!isLoggedIn || loading || error) {
        return null
    }

    const getPlanColor = () => {
        switch (plan?.toLowerCase()) {
            case 'free':
                return 'default'
            case 'basic':
                return 'primary'
            case 'pro':
                return 'secondary'
            case 'enterprise':
                return 'success'
            default:
                return 'default'
        }
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Tooltip title="Your available credits">
                <Chip
                    label={`${credits} credits`}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            </Tooltip>
            {plan && (
                <Tooltip title="Your current plan">
                    <Chip
                        label={plan.charAt(0).toUpperCase() + plan.slice(1)}
                        color={getPlanColor()}
                        size="small"
                    />
                </Tooltip>
            )}
        </Box>
    )
}

export default UserCredits