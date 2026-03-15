import { db } from "../db"
import bcrypt from "bcrypt"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { signToken } from "../lib/jwt"

class AuthService {
  async login(email: string, password: string) {
    const [user] = await db
      .select({
        id: usersTable.id,
        password: usersTable.password,
        role: usersTable.role
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))

    if (!user) throw new Error('invalid credentials')

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new Error('invalid credentials')

    const token = await signToken({
      sub: user.id!,
      role: user.role
    })

    return { user: { id: user.id, role: user.role }, token }
  }
}

export default new AuthService()
