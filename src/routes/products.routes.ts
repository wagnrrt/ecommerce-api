import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import ProductsController from "../controllers/products.controller"
import adminMiddleware from "../middlewares/admin.middleware"

const router = Router()

router.get('/', ProductsController.index)

router.use(authMiddleware, adminMiddleware)

router.post('/', ProductsController.create)
router.patch('/:id', ProductsController.update)
router.delete('/:id', ProductsController.remove)

export default router
