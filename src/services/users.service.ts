import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"

class UsersService {
  async me(userId: string) {
    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))

    return { user }
  }

  async create(name: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10)
    await db.insert(usersTable).values({ name, email, password: hash })
  }
}

export default new UsersService()
