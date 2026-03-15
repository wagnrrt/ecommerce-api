import { Request, Response } from "express"
import { createUserSchema } from "../schemas/users.schema"
import { ZodError } from "zod"
import UsersService from "../services/users.service"

interface AuthRequest extends Request {
  user?: any
}

class UsersController {
  async me(req: AuthRequest, res: Response) {
    try {
      const result = await UsersService.me(req.user.sub)
      return res.json({ user: result })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = createUserSchema.parse(req.body)
      await UsersService.create(name, email, password)
      return res.status(201).json({ message: 'user created' })
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'email already exists' })
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new UsersController()
