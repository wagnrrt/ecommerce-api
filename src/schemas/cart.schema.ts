import z from "zod";

export const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100)
})

export const updateCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100)
})

export const removeFromCartSchema = z.object({
  productId: z.number().int().positive(),
})
