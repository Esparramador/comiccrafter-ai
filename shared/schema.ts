import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Secundario"),
  description: text("description").notNull().default(""),
  voice: text("voice").notNull().default("No asignada"),
  has3D: boolean("has_3d").notNull().default(false),
  photoUrls: text("photo_urls").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  genre: text("genre").notNull().default(""),
  language: text("language").notNull().default("Español"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
});

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export const comicPages = pgTable("comic_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Página sin título"),
  scriptId: integer("script_id"),
  panelImages: text("panel_images").array().notNull().default(sql`'{}'::text[]`),
  panelTexts: jsonb("panel_texts").notNull().default(sql`'[]'::jsonb`),
  style: text("style").notNull().default("manga"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertComicPageSchema = createInsertSchema(comicPages).omit({
  id: true,
  createdAt: true,
});

export type InsertComicPage = z.infer<typeof insertComicPageSchema>;
export type ComicPage = typeof comicPages.$inferSelect;

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  totalGenerations: integer("total_generations").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAppUserSchema = createInsertSchema(appUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertAppUser = z.infer<typeof insertAppUserSchema>;
export type AppUser = typeof appUsers.$inferSelect;

export const serviceLimits = pgTable("service_limits", {
  id: serial("id").primaryKey(),
  planName: text("plan_name").notNull(),
  serviceName: text("service_name").notNull(),
  maxQuantity: integer("max_quantity").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertServiceLimitSchema = createInsertSchema(serviceLimits).omit({
  id: true,
});

export type InsertServiceLimit = z.infer<typeof insertServiceLimitSchema>;
export type ServiceLimit = typeof serviceLimits.$inferSelect;

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull().default(""),
  priceMonthly: integer("price_monthly").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  features: jsonb("features").notNull().default(sql`'[]'::jsonb`),
  maxImages: integer("max_images").notNull().default(0),
  maxVideos: integer("max_videos").notNull().default(0),
  max3dModels: integer("max_3d_models").notNull().default(0),
  maxScripts: integer("max_scripts").notNull().default(0),
  maxVoices: integer("max_voices").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  badgeColor: text("badge_color").notNull().default("#8B5CF6"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export { conversations, messages } from "./models/chat";
export type { Conversation, InsertConversation, Message, InsertMessage } from "./models/chat";
