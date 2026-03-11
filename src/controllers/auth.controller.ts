import { Request, Response } from "express"
import { loginSchema } from "../schemas/users.schema"
import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { signToken } from "../lib/jwt"

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body)
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    const hash = user[0]?.password

    if (!hash) return res.status(404).json({ message: 'user not found' })

    const isPasswordValid = await bcrypt.compare(password, hash)

    if (!isPasswordValid)
      return res.status(401).json({ message: 'incorrect password' })

    const token = await signToken({
      id: user[0]?.id
    })

    return res.status(201).json({ token })
  }
}

export default new AuthController()
