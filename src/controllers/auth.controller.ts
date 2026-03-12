import { Request, Response } from "express"
import { loginSchema } from "../schemas/users.schema"
import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { signToken } from "../lib/jwt"

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body)
      const user = await db
        .select({
          id: usersTable.id,
          password: usersTable.password,
          role: usersTable.role
        })
        .from(usersTable)
        .where(eq(usersTable.email, email))

      const foundUser = user[0]

      if (!foundUser) return res.status(404).json({ message: 'user not found' })

      const isPasswordValid = await bcrypt.compare(password, foundUser.password)

      if (!isPasswordValid)
        return res.status(401).json({ message: 'invalid credentials' })

      const token = await signToken({
        sub: foundUser.id!,
        role: foundUser.role
      })

      return res.status(200).json({ token })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new AuthController()
