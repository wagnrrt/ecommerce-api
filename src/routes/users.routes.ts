import { Router } from "express"
import UsersController from "../controllers/users.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router = Router()

router.post('/users', UsersController.create)
router.get('/users/me', authMiddleware, UsersController.me)

export default router
