import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password: z.string().min(8).max(255)
})

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(255)
})
