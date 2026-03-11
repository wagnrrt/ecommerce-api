import { Request, Response } from "express"
import { createUserSchema } from "../schemas/users.schema"
import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"

class UsersController {
  async create(req: Request, res: Response) {
    const { name, email, password } = createUserSchema.parse(req.body)
    const hash = await bcrypt.hash(password, 10)

    await db.insert(usersTable).values({ name, email, password: hash })

    return res.status(201).json({ name, email })
  }
}

export default new UsersController()
