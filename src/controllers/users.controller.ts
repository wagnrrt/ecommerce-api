import { Request, Response } from "express"
import { createUserSchema } from "../schemas/users.schema"
import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"

interface AuthRequest extends Request {
  user?: any
}

class UsersController {
  async me(req: AuthRequest, res: Response) {

    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))

    return res.json({ user: user })
  }

  async create(req: Request, res: Response) {
    const { name, email, password } = createUserSchema.parse(req.body)
    const hash = await bcrypt.hash(password, 10)

    await db.insert(usersTable).values({ name, email, password: hash })

    return res.status(201).json({ name, email })
  }
}

export default new UsersController()
