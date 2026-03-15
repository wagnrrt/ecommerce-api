import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import CartController from "../controllers/cart.controller"

const router = Router()

router.use(authMiddleware)

router.get('/', CartController.index)
router.post('/', CartController.add)
router.patch('/', CartController.update)
router.delete('/:id', CartController.remove)

router.post('/checkout', CartController.checkout)

export default router
