import { db } from "./db";
import { eq, desc, sql, count, like } from "drizzle-orm";
import {
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter,
  generatedImages, type GeneratedImage, type InsertGeneratedImage,
  scripts, type Script, type InsertScript,
  comicPages, type ComicPage, type InsertComicPage,
  appUsers, type AppUser, type InsertAppUser,
  serviceLimits, type ServiceLimit, type InsertServiceLimit,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(data: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, data: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<void>;

  getAllImages(): Promise<GeneratedImage[]>;
  createImage(data: InsertGeneratedImage): Promise<GeneratedImage>;
  deleteImage(id: number): Promise<void>;

  getAllScripts(): Promise<Script[]>;
  createScript(data: InsertScript): Promise<Script>;
  deleteScript(id: number): Promise<void>;

  getAllComicPages(): Promise<ComicPage[]>;
  createComicPage(data: InsertComicPage): Promise<ComicPage>;
  deleteComicPage(id: number): Promise<void>;

  getAllAppUsers(search?: string): Promise<AppUser[]>;
  getAppUser(id: number): Promise<AppUser | undefined>;
  createAppUser(data: InsertAppUser): Promise<AppUser>;
  updateAppUser(id: number, data: Partial<InsertAppUser>): Promise<AppUser | undefined>;
  deleteAppUser(id: number): Promise<void>;
  getAppUserCount(): Promise<number>;

  getAllServiceLimits(): Promise<ServiceLimit[]>;
  getServiceLimitsByPlan(planName: string): Promise<ServiceLimit[]>;
  createServiceLimit(data: InsertServiceLimit): Promise<ServiceLimit>;
  updateServiceLimit(id: number, data: Partial<InsertServiceLimit>): Promise<ServiceLimit | undefined>;
  deleteServiceLimit(id: number): Promise<void>;

  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<void>;

  getAdminStats(): Promise<{
    totalUsers: number;
    totalGenerations: number;
    totalImages: number;
    totalScripts: number;
    totalCharacters: number;
    planBreakdown: { plan: string; count: number }[];
    activeUsers: number;
    bannedUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getAllCharacters(): Promise<Character[]> {
    return db.select().from(characters).orderBy(desc(characters.createdAt));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [char] = await db.select().from(characters).where(eq(characters.id, id));
    return char;
  }

  async createCharacter(data: InsertCharacter): Promise<Character> {
    const [char] = await db.insert(characters).values(data).returning();
    return char;
  }

  async updateCharacter(id: number, data: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [char] = await db.update(characters).set(data).where(eq(characters.id, id)).returning();
    return char;
  }

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  async getAllImages(): Promise<GeneratedImage[]> {
    return db.select().from(generatedImages).orderBy(desc(generatedImages.createdAt));
  }

  async createImage(data: InsertGeneratedImage): Promise<GeneratedImage> {
    const [img] = await db.insert(generatedImages).values(data).returning();
    return img;
  }

  async deleteImage(id: number): Promise<void> {
    await db.delete(generatedImages).where(eq(generatedImages.id, id));
  }

  async getAllScripts(): Promise<Script[]> {
    return db.select().from(scripts).orderBy(desc(scripts.createdAt));
  }

  async createScript(data: InsertScript): Promise<Script> {
    const [s] = await db.insert(scripts).values(data).returning();
    return s;
  }

  async deleteScript(id: number): Promise<void> {
    await db.delete(scripts).where(eq(scripts.id, id));
  }

  async getAllComicPages(): Promise<ComicPage[]> {
    return db.select().from(comicPages).orderBy(desc(comicPages.createdAt));
  }

  async createComicPage(data: InsertComicPage): Promise<ComicPage> {
    const [page] = await db.insert(comicPages).values(data).returning();
    return page;
  }

  async deleteComicPage(id: number): Promise<void> {
    await db.delete(comicPages).where(eq(comicPages.id, id));
  }

  async getAllAppUsers(search?: string): Promise<AppUser[]> {
    if (search) {
      return db.select().from(appUsers).where(like(appUsers.email, `%${search}%`)).orderBy(desc(appUsers.createdAt));
    }
    return db.select().from(appUsers).orderBy(desc(appUsers.createdAt));
  }

  async getAppUser(id: number): Promise<AppUser | undefined> {
    const [u] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return u;
  }

  async createAppUser(data: InsertAppUser): Promise<AppUser> {
    const [u] = await db.insert(appUsers).values(data).returning();
    return u;
  }

  async updateAppUser(id: number, data: Partial<InsertAppUser>): Promise<AppUser | undefined> {
    const [u] = await db.update(appUsers).set(data).where(eq(appUsers.id, id)).returning();
    return u;
  }

  async deleteAppUser(id: number): Promise<void> {
    await db.delete(appUsers).where(eq(appUsers.id, id));
  }

  async getAppUserCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(appUsers);
    return result?.value || 0;
  }

  async getAllServiceLimits(): Promise<ServiceLimit[]> {
    return db.select().from(serviceLimits).orderBy(serviceLimits.planName, serviceLimits.serviceName);
  }

  async getServiceLimitsByPlan(planName: string): Promise<ServiceLimit[]> {
    return db.select().from(serviceLimits).where(eq(serviceLimits.planName, planName));
  }

  async createServiceLimit(data: InsertServiceLimit): Promise<ServiceLimit> {
    const [sl] = await db.insert(serviceLimits).values(data).returning();
    return sl;
  }

  async updateServiceLimit(id: number, data: Partial<InsertServiceLimit>): Promise<ServiceLimit | undefined> {
    const [sl] = await db.update(serviceLimits).set(data).where(eq(serviceLimits.id, id)).returning();
    return sl;
  }

  async deleteServiceLimit(id: number): Promise<void> {
    await db.delete(serviceLimits).where(eq(serviceLimits.id, id));
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values(data).returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, data: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id)).returning();
    return plan;
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  async getAdminStats() {
    const [usersCount] = await db.select({ value: count() }).from(appUsers);
    const [imagesCount] = await db.select({ value: count() }).from(generatedImages);
    const [scriptsCount] = await db.select({ value: count() }).from(scripts);
    const [charsCount] = await db.select({ value: count() }).from(characters);
    const [genSum] = await db.select({ value: sql<number>`COALESCE(SUM(${appUsers.totalGenerations}), 0)` }).from(appUsers);
    const planBreakdown = await db.select({ plan: appUsers.plan, count: count() }).from(appUsers).groupBy(appUsers.plan);
    const [activeCount] = await db.select({ value: count() }).from(appUsers).where(eq(appUsers.status, "active"));
    const [bannedCount] = await db.select({ value: count() }).from(appUsers).where(eq(appUsers.status, "banned"));
    return {
      totalUsers: usersCount?.value || 0,
      totalGenerations: Number(genSum?.value) || 0,
      totalImages: imagesCount?.value || 0,
      totalScripts: scriptsCount?.value || 0,
      totalCharacters: charsCount?.value || 0,
      planBreakdown: planBreakdown.map(p => ({ plan: p.plan, count: p.count })),
      activeUsers: activeCount?.value || 0,
      bannedUsers: bannedCount?.value || 0,
    };
  }
}

export const storage = new DatabaseStorage();
