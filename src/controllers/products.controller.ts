import { Request, Response } from "express"
import { db } from "../db"
import { productsTable } from "../db/schema"
import { createProductSchema, removeProductSchema, updateProductParamsSchema, updateProductSchema } from "../schemas/products.schema"
import { eq } from "drizzle-orm"
import { ZodError } from "zod"
import { stripe } from "../lib/stripe"

class ProductsController {
  async index(req: Request, res: Response) {
    try {
      const products = await db.select().from(productsTable).limit(20)

      if (!products.length) return res.status(404).json({ message: 'no products found' })
      return res.status(200).json({ products })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, stock } = createProductSchema.parse(req.body)
      const stripeProduct = await stripe.products.create({
        name,
        description
      })

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: 'brl',
        unit_amount: price
      })


      await db.insert(productsTable).values({
        name,
        description,
        price,
        stock,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id
      })

      return res.status(201).json({
        name,
        description,
        price,
        stock,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id
      })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = updateProductParamsSchema.parse(req.params.id)
      const { name, description, price, stock } = updateProductSchema.parse(req.body)
      if ([name, description, price, stock].every(field => field === undefined))
        return res.status(400).json({ message: 'no field provided for update' })

      const [product] = await db
        .select({
          price: productsTable.price,
          stripeProductId: productsTable.stripeProductId,
          stripePriceId: productsTable.stripePriceId
        })
        .from(productsTable)
        .where(eq(productsTable.id, id))

      if (!product)
        return res.status(404).json({ message: "product not found" })

      if (name || description) {
        await stripe.products.update(product.stripeProductId, {
          name,
          description
        })
      }

      let newPriceId = product.stripePriceId

      if (price && price !== product.price) {
        const newPrice = await stripe.prices.create({
          product: product.stripeProductId,
          currency: 'brl',
          unit_amount: price
        })

        await stripe.prices.update(product.stripePriceId, {
          active: false
        })

        newPriceId = newPrice.id
      }

      await db.update(productsTable).set({ name, description, price, stock, stripePriceId: newPriceId }).where(eq(productsTable.id, id))

      return res.status(200).json({ message: 'product updated' })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = removeProductSchema.parse(req.params.id)

      const [product] = await db
        .select({
          stripeProductId: productsTable.stripeProductId,
          stripePriceId: productsTable.stripePriceId
        })
        .from(productsTable)
        .where(eq(productsTable.id, id))

      await stripe.products.update(product.stripeProductId, {
        active: false
      })

      await stripe.prices.update(product.stripePriceId, {
        active: false
      })

      await db.delete(productsTable).where(eq(productsTable.id, id))

      return res.status(200).send()
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }
}

export default new ProductsController()
