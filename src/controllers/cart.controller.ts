import { Request, Response } from "express"
import { addToCartSchema, checkoutCartSchema, removeFromCartSchema, updateCartParamsSchema, updateCartSchema } from "../schemas/cart.schema"
import { ZodError } from "zod"
import CartService from "../services/cart.service"

export interface AuthRequest extends Request {
  user?: {
    sub: string
  }
}

class CartController {
  async index(req: Request, res: Response) {
    try {
      const products = await CartService.index()
      return res.status(200).json({ products })
    } catch (err) {
      if (err instanceof Error && err.message === 'no products found')
        return res.status(404).json({ message: err.message })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async add(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity } = addToCartSchema.parse(req.body)
      const item = await CartService.add(productId, quantity, req.user!.sub)
      return res.status(201).json({ item })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      if (err instanceof Error && err.message === 'product not found')
        return res.status(400).json({ message: err.message })
      if (err instanceof Error && err.message === 'insufficient stock')
        return res.status(400).json({ message: err.message })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { productId } = updateCartParamsSchema.parse(req.params.id)
      const { quantity } = updateCartSchema.parse(req.body)
      const item = await CartService.update(productId, quantity, req.user!.sub)
      return res.status(200).json({ item })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      if (err instanceof Error && err.message === 'product not found')
        return res.status(400).json({ message: err.message })
      if (err instanceof Error && err.message === 'insufficient stock')
        return res.status(400).json({ message: err.message })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: AuthRequest, res: Response) {
    try {
      const { productId } = removeFromCartSchema.parse(req.params.id)
      await CartService.remove(productId, req.user!.sub)
      return res.status(204).send()
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async checkout(req: AuthRequest, res: Response) {
    try {
      const { productId } = checkoutCartSchema.parse(req.body)
      const { sessionId } = await CartService.checkout(productId, req.user!.sub)

      return res.status(200).json({ sessionId })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new CartController()
