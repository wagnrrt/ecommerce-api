import z from "zod";

const productIdBody = z.number().int().positive()
const productIdParam = z.coerce.number().int().positive()
const quantityBody = z.number().int().min(1).max(100)

export const addToCartSchema = z.object({
  productId: productIdBody,
  quantity: quantityBody
})

export const updateCartParamsSchema = z.object({
  productId: productIdParam,
})

export const updateCartSchema = z.object({
  quantity: quantityBody
})

export const removeFromCartSchema = z.object({
  productId: productIdParam,
})

export const checkoutCartSchema = z.object({
  productId: productIdBody,
})
