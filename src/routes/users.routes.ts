import { Router } from "express"
import UsersController from "../controllers/users.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router = Router()

router.post('/', UsersController.create)
router.get('/me', authMiddleware, UsersController.me)

export default router
