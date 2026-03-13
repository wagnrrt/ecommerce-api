import { Request, Response } from "express"
import { createUserSchema } from "../schemas/users.schema"
import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { ZodError } from "zod"

interface AuthRequest extends Request {
  user?: any
}

class UsersController {
  async me(req: AuthRequest, res: Response) {
    try {
      const user = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        })
        .from(usersTable)
        .where(eq(usersTable.id, req.user.sub))

      return res.json({ user: user[0] })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = createUserSchema.parse(req.body)
      const hash = await bcrypt.hash(password, 10)

      await db.insert(usersTable).values({ name, email, password: hash })

      return res.status(201).send()
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
