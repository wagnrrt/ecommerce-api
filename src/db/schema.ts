import { createId } from '@paralleldrive/cuid2';
import { mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: varchar({ length: 25 }).primaryKey().$defaultFn(() => createId()),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum('role', ['user', 'admin']).notNull().default('user')
});
