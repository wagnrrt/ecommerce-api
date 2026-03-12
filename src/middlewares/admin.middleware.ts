import { NextFunction, Request, Response } from "express";

interface AuthRequest extends Request {
  user?: { id: string; role: string }
}

export default async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) return res.status(401).json({ message: 'unauthenticated' })
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })

    next()
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'internal server error' })
  }
}
