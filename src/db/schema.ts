import { createId } from '@paralleldrive/cuid2';
import { decimal, int, mysqlEnum, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: varchar({ length: 25 }).primaryKey().$defaultFn(() => createId()),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum('role', ['user', 'admin']).notNull().default('user')
});

export const productsTable = mysqlTable('products', {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  stock: int().default(0)
});
