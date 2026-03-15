import { db } from "../db"
import { productsTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "../lib/stripe"

class ProductsService {
  async index() {
    const [products] = await db.select().from(productsTable).limit(20)
    if (!products) throw new Error('no products found')
    return { products }
  }

  async create(name: string, description: string, price: number, stock: number) {
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

    return {
      name,
      description,
      price,
      stock,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    }
  }

  async update(
    id: number,
    name?: string,
    description?: string,
    price?: number,
    stock?: number
  ) {
    const [current] = await db
      .select({
        stripeProductId: productsTable.stripeProductId,
        stripePriceId: productsTable.stripePriceId,
        price: productsTable.price,
        name: productsTable.name,
        description: productsTable.description,
        stock: productsTable.stock
      })
      .from(productsTable)
      .where(eq(productsTable.id, id))

    if (!current) throw new Error('product not found')

    if (name || description) {
      await stripe.products.update(current.stripeProductId, {
        ...(name && { name }),
        ...(description && { description })
      })
    }

    let newPriceId = current.stripePriceId

    if (price !== undefined && price !== current.price) {
      const newPrice = await stripe.prices.create({
        product: current.stripeProductId,
        currency: 'brl',
        unit_amount: price
      })
      await stripe.prices.update(current.stripePriceId, { active: false })
      newPriceId = newPrice.id
    }

    const [result] = await db.update(productsTable)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        stripePriceId: newPriceId
      })
      .where(eq(productsTable.id, id))

    if (result.affectedRows === 0) throw new Error('product not found')

    return {
      id,
      name: name ?? current.name,
      description: description ?? current.description,
      price: price ?? current.price,
      stock: stock ?? current.stock,
      stripePriceId: newPriceId
    }
  }

  async remove(id: number) {
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
  }
}

export default new ProductsService()
