import { db } from "../db"
import { cartTable, productsTable } from "../db/schema"
import { and, eq } from "drizzle-orm"
import { stripe } from "../lib/stripe"

class CartService {
  async index() {
    const products = await db.select().from(cartTable).limit(20)
    if (!products.length) throw new Error('no products found')
    return products
  }

  async add(productId: number, quantity: number, userId: string) {
    const [product] = await db
      .select({ id: productsTable.id, stock: productsTable.stock })
      .from(productsTable)
      .where(eq(productsTable.id, productId))

    if (!product) throw new Error('product not found')
    if (product.stock < quantity) throw new Error('insufficient stock')

    await db
      .insert(cartTable)
      .values({ userId, productId, quantity })

    return { productId, quantity, userId }
  }


  async update(productId: number, quantity: number, userId: string) {
    const [product] = await db
      .select({ id: productsTable.id, stock: productsTable.stock })
      .from(productsTable)
      .where(eq(productsTable.id, productId))

    if (!product) throw new Error('product not found')
    if (product.stock < quantity) throw new Error('insufficient stock')

    await db
      .update(cartTable)
      .set({ quantity })
      .where(
        and(
          eq(cartTable.userId, userId),
          eq(cartTable.productId, productId)
        )
      )

    return { product }
  }

  async remove(productId: number, userId: string) {
    await db
      .delete(cartTable)
      .where(
        and(
          eq(cartTable.userId, userId),
          eq(cartTable.productId, productId)
        )
      )
  }

  async checkout(productId: number, userId: string) {
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
          eq(cartTable.userId, userId),
          eq(cartTable.productId, productId)
        )
      )

    if (!item) throw new Error('product not found')

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

    return { sessionId: session.id }
  }
}

export default new CartService()
