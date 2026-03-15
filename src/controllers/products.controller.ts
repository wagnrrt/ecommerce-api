import { Request, Response } from "express"
import { createProductSchema, removeProductSchema, updateProductParamsSchema, updateProductSchema } from "../schemas/products.schema"
import { ZodError } from "zod"
import ProductsService from "../services/products.service"

class ProductsController {
  async index(req: Request, res: Response) {
    try {
      const products = await ProductsService.index()
      return res.status(200).json({ products })
    } catch (err) {
      if (err instanceof Error && err.message === 'no products found')
        return res.status(400).json({ message: err.message })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, stock } = createProductSchema.parse(req.body)
      const result = await ProductsService.create(name, description, price, stock)
      return res.status(201).json({ product: result })
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

      const result = await ProductsService.update(id, name, description, price, stock)

      return res.status(200).json({ product: result })
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: 'invalid input' })
      if (err instanceof Error && err.message === 'product not found')
        return res.status(400).json({ message: err.message })
      console.log(err)
      return res.status(500).json({ message: 'internal server error' })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = removeProductSchema.parse(req.params.id)
      await ProductsService.remove(id)
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
