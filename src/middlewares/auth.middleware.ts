import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

interface AuthRequest extends Request {
  user?: any
}

export default async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader) return res.status(401).json({ error: 'token missing' })

  const [, token] = authHeader.split(' ')

  try {
    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'invalid token' })
  }
}
