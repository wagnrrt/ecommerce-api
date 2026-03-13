import usersRoutes from './users.routes'
import productsRoutes from './products.routes'
import cartRoutes from './cart.routes'
import authRoutes from './auth.routes'
import { Router } from 'express'

const router = Router()

router.use('/users', usersRoutes)
router.use('/auth', authRoutes)
router.use('/products', productsRoutes)
router.use('/cart', cartRoutes)

export default router
