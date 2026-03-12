import z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(2).max(65535),
  price: z.preprocess((val) => typeof val === 'number' ? val.toFixed(2) : val, z.string()),
  stock: z.number().int().min(0).max(1000000).default(0),
})

export const updateProductSchema = z.object({
  id: z.number().int().min(1),
  name: z.string().min(2).max(255).optional(),
  description: z.string().min(2).max(65535).optional(),
  price: z.preprocess((val) => typeof val === 'number' ? val.toFixed(2) : val, z.string().optional()),
  stock: z.number().int().min(0).max(1000000).default(0).optional(),
})

export const removeProductSchema = z.object({
  id: z.number().int().min(1),
})
