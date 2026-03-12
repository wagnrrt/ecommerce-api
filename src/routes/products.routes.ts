import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import ProductsController from "../controllers/products.controller"
import adminMiddleware from "../middlewares/admin.middleware"

const router = Router()

router.get('/', ProductsController.index)

router.use(authMiddleware, adminMiddleware)

router.post('/', ProductsController.create)
router.patch('/', ProductsController.update)
router.delete('/', ProductsController.remove)

export default router
