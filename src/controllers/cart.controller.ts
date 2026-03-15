import { Request, Response } from "express"
import { db } from "../db"
import { cartTable, productsTable } from "../db/schema"
import { and, eq } from "drizzle-orm"
import { addToCartSchema, checkoutCartSchema, removeFromCartSchema, updateCartParamsSchema, updateCartSchema } from "../schemas/cart.schema"
import { ZodError } from "zod"
import { stripe } from "../lib/stripe"


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
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { productId } = updateCartParamsSchema.parse(req.params.id)
      const { quantity } = updateCartSchema.parse(req.body)

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
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: AuthRequest, res: Response) {
    try {
      const { productId } = removeFromCartSchema.parse(req.params.id)
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
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async checkout(req: AuthRequest, res: Response) {
    try {
      const { productId } = checkoutCartSchema.parse(req.body)

      const [item] = await db
        .select({
          stripePriceId: productsTable.stripePriceId,
          quantity: cartTable.quantity
        })
        .from(cartTable)
        .innerJoin(
          productsTable,
          eq(cartTable.productId, productsTable.id)
        )
        .where(
          and(
            eq(cartTable.userId, req.user!.sub),
            eq(cartTable.productId, productId)
          )
        )

      if (!item)
        return res.status(404).json({ message: "product not found" })

      const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        line_items: [
          {
            price: item.stripePriceId,
            quantity: item.quantity,
          },
        ],
        mode: 'payment',
      });

      return res.status(200).json({ sessionId: session.id })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new CartController()
