import { pgTable, uuid, varchar, timestamp, integer, decimal, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scis = pgTable("scis", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  capitalSocial: decimal("capital_social", { precision: 12, scale: 2 }),
  totalParts: integer("total_parts").notNull().default(1),
  adminId: uuid("admin_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shareholders = pgTable("shareholders", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id").notNull().references(() => scis.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  partsOwned: integer("parts_owned").notNull().default(0),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ags = pgTable("ags", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id").notNull().references(() => scis.id),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  ordreDuJour: text("ordre_du_jour"),
  pvUrl: text("pv_url"),
  status: varchar("status", { length: 50 }).notNull().default("planned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id").notNull().references(() => scis.id),
  type: varchar("type", { length: 50 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
