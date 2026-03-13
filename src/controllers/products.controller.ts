import { Request, Response } from "express"
import { db } from "../db"
import { productsTable } from "../db/schema"
import { createProductSchema, removeProductSchema, updateProductSchema } from "../schemas/products.schema"
import { eq } from "drizzle-orm"
import { ZodError } from "zod"

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
      const product = await db.insert(productsTable).values({ name, description, price, stock })

      return res.status(201).json({ product })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id, name, description, price, stock } = updateProductSchema.parse(req.body)
      if ([name, description, price, stock].every(field => field === undefined))
        return res.status(400).json({ message: 'no field provided for update' })

      const product = await db.update(productsTable).set({ name, description, price, stock }).where(eq(productsTable.id, id))

      return res.status(200).json({ product })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = removeProductSchema.parse(req.body)
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
