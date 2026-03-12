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
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) return res.status(401).json({ error: 'token missing' })

    const [, token] = authHeader.split(' ')

    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (err) {
    console.log(err)
    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID')
      return res.status(401).json({ error: 'invalid token' })

    return res.status(500).json({ message: 'internal server error' })
  }
}
