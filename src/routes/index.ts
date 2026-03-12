import usersRoutes from './users.routes'
import authRoutes from './auth.routes'
import { Router } from 'express'

const router = Router()

router.use('/users', usersRoutes)
router.use('/auth', authRoutes)
router.use('/products', authRoutes)

export default router
