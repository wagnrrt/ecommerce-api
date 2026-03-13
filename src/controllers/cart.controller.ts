import { Request, Response } from "express"
import { db } from "../db"
import { cartTable, productsTable } from "../db/schema"
import { and, eq } from "drizzle-orm"
import { addToCartSchema, removeFromCartSchema, updateCartSchema } from "../schemas/cart.schema"


export interface AuthRequest extends Request {
  user?: {
    sub: string
  }
}

class CartController {
  async index(req: Request, res: Response) {
    try {
      const products = await db.select().from(cartTable).limit(20)

      if (!products.length) return res.status(404).json({ message: 'no products found' })
      return res.status(200).json({ products })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async add(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity } = addToCartSchema.parse(req.body)

      const product = await db
        .select({ id: productsTable.id, stock: productsTable.stock })
        .from(productsTable)
        .where(eq(productsTable.id, productId))

      if (!product.length) return res.status(404).json({ message: 'product not found' })
      if (product[0].stock < quantity) return res.status(404).json({ message: 'insufficient stock' })

      await db
        .insert(cartTable)
        .values({ userId: req.user!.sub, productId, quantity })

      return res.status(200).send()
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity } = updateCartSchema.parse(req.body)

      const product = await db
        .select({ id: productsTable.id, stock: productsTable.stock })
        .from(productsTable)
        .where(eq(productsTable.id, productId))

      if (!product.length) return res.status(404).json({ message: 'product not found' })
      if (product[0].stock < quantity) return res.status(404).json({ message: 'insufficient stock' })

      await db
        .update(cartTable)
        .set({ quantity })
        .where(
          and(
            eq(cartTable.userId, req.user!.sub),
            eq(cartTable.productId, productId)
          )
        )

      return res.status(200).send()
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: AuthRequest, res: Response) {
    try {
      const { productId } = removeFromCartSchema.parse(req.body)
      await db
        .delete(cartTable)
        .where(
          and(
            eq(cartTable.userId, req.user!.sub),
            eq(cartTable.productId, productId)
          )
        )

      return res.status(200).send()
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new CartController()
