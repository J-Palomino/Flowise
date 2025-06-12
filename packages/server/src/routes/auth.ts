import express from 'express'
import { register, login, logout, getCurrentUser } from '../controllers/auth'
import { authenticate } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticate, getCurrentUser)

export default router