import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import CartController from "../controllers/cart.controller"

const router = Router()

router.use(authMiddleware)

router.get('/', CartController.index)
router.post('/', CartController.add)
router.patch('/', CartController.update)
router.delete('/', CartController.remove)

export default router
