import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scis = pgTable("scis", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  capitalSocial: decimal("capital_social", { precision: 12, scale: 2 }),
  totalParts: integer("total_parts").notNull().default(1),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shareholders = pgTable("shareholders", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id")
    .notNull()
    .references(() => scis.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  partsOwned: integer("parts_owned").notNull().default(0),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ags = pgTable("ags", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id")
    .notNull()
    .references(() => scis.id),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  ordreDuJour: text("ordre_du_jour"),
  pvUrl: text("pv_url"),
  status: varchar("status", { length: 50 }).notNull().default("planned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sciId: uuid("sci_id")
    .notNull()
    .references(() => scis.id),
  type: varchar("type", { length: 50 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── LemonSqueezy billing ──────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  lemonSqueezyId: varchar("lemon_squeezy_id", { length: 128 }).notNull().unique(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  productName: varchar("product_name", { length: 255 }),
  variantName: varchar("variant_name", { length: 255 }),
  renewsAt: timestamp("renews_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkoutSessions = pgTable("checkout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  lemonSqueezyId: varchar("lemon_squeezy_id", { length: 128 }).notNull().unique(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  url: text("url"),
  price: decimal("price", { precision: 8, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Outbound marketing ─────────────────────────────────────────

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: varchar("source", { length: 50 }).notNull(), // reddit, forum, search, …
  sourceUrl: text("source_url"), // lien vers le post
  platform: varchar("platform", { length: 50 }).notNull(), // reddit, les-impots, …
  username: varchar("username", { length: 128 }),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  publicEmail: boolean("public_email").default(false),
  painSnippet: text("pain_snippet"), // extrait de leur message
  language: varchar("language", { length: 8 }).default("fr"),
  score: integer("score").default(0), // 0-100, qualité du lead
  tags: text("tags"), // comma-separated
  contacted: boolean("contacted").default(false),
  subscribed: boolean("subscribed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

export const outreachCampaigns = pgTable("outreach_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // ex: "reddit_mai_2025"
  template: text("template").notNull(), // body du mail
  subject: varchar("subject", { length: 255 }).notNull(),
  totalSent: integer("total_sent").default(0),
  totalOpened: integer("total_opened").default(0),
  totalClicked: integer("total_clicked").default(0),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outreachLogs = pgTable("outreach_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => outreachCampaigns.id),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
