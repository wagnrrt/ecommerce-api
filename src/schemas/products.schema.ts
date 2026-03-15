import z from "zod";

const productBase = {
  name: z.string().min(2).max(255),
  description: z.string().min(2).max(65535),
  price: z.number().int().min(0).max(100_000_000),
  stock: z.number().int().min(0).max(1_000_000),
}

export const createProductSchema = z.object({
  ...productBase
})

export const updateProductSchema = z.object({
  name: productBase.name.optional(),
  description: productBase.description.optional(),
  price: productBase.price.optional(),
  stock: productBase.stock.optional(),
})

export const updateProductParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export const removeProductSchema = updateProductParamsSchema
