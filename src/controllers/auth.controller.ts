import { Request, Response } from "express"
import { loginSchema } from "../schemas/users.schema"
import { ZodError } from "zod"
import AuthService from "../services/auth.service"

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body)

      const { user, token } = await AuthService.login(email, password)

      return res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000,
        sameSite: 'strict'
      }).status(200).json({ user })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      if (err instanceof Error && err.message === 'invalid credentials')
        return res.status(400).json({ message: 'invalid credentials' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new AuthController()
