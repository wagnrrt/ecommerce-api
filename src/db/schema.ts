import { createId } from '@paralleldrive/cuid2';
import { int, mysqlEnum, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: varchar({ length: 25 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar({ length: 255 })
    .notNull(),
  email: varchar({ length: 255 })
    .notNull()
    .unique(),
  password: varchar({ length: 255 })
    .notNull(),
  role: mysqlEnum('role', ['user', 'admin'])
    .notNull()
    .default('user')
});

export const productsTable = mysqlTable('products', {
  id: int()
    .primaryKey()
    .autoincrement(),
  name: varchar({ length: 255 })
    .notNull(),
  description: text(),
  price: int()
    .notNull(),
  stock: int()
    .default(0)
    .notNull(),
  stripeProductId: varchar('stripe_product_id', { length: 255 })
    .notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 })
    .notNull()
});

export const cartTable = mysqlTable('cart', {
  id: int()
    .primaryKey()
    .autoincrement(),
  userId: varchar('user_id', { length: 25 })
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade'
    }),
  productId: int('product_id')
    .notNull()
    .references(() => productsTable.id, {
      onDelete: 'cascade'
    }),
  quantity: int()
    .notNull()
})
