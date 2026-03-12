import { Router } from "express"
import UsersController from "../controllers/users.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router = Router()

router.get('/', ProductsController.index)

router.use(authMiddleware, adminMiddleware)

router.post('/', ProductsController.create)
router.patch('/', ProductsController.update)
router.delete('/', ProductsController.remove)

export default router
