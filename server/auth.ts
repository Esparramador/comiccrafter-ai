import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { storage } from "./storage";
import type { AppUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "comic-crafter-jwt-secret-2025";
const JWT_EXPIRES_IN = "30d";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface AuthPayload {
  userId: number;
  email: string;
}

export function generateToken(user: AppUser): string {
  const payload: AuthPayload = { userId: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

function sanitizeUser(user: AppUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const existing = await storage.getAppUserByEmail(email);
  if (existing) {
    throw new Error("Ya existe una cuenta con este email");
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await storage.createAppUser({
    email,
    name,
    passwordHash: hash,
    authProvider: "email",
    plan: "free",
    status: "active",
    credits: 0,
    totalGenerations: 0,
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function loginWithEmail(email: string, password: string) {
  const user = await storage.getAppUserByEmail(email);
  if (!user) {
    throw new Error("Email o contraseña incorrectos");
  }

  if (!user.passwordHash) {
    throw new Error("Esta cuenta usa Google Sign-In. Inicia sesión con Google.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Email o contraseña incorrectos");
  }

  if (user.status === "banned") {
    throw new Error("Tu cuenta ha sido suspendida");
  }

  await storage.updateAppUser(user.id, { lastLoginAt: new Date() } as any);
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function loginWithGoogle(credential: string) {
  let payload;
  try {
    if (GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      const decoded = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
      payload = decoded;
    }
  } catch (err: any) {
    throw new Error("Token de Google inválido");
  }

  if (!payload || !payload.email) {
    throw new Error("No se pudo obtener el email de Google");
  }

  const { email, name, picture, sub: googleId } = payload;

  let user = await storage.getAppUserByGoogleId(googleId);

  if (!user) {
    user = await storage.getAppUserByEmail(email);
    if (user) {
      await storage.updateAppUser(user.id, {
        googleId,
        avatarUrl: picture || user.avatarUrl,
        name: name || user.name,
        authProvider: user.passwordHash ? "both" : "google",
      } as any);
      user = await storage.getAppUser(user.id);
    } else {
      user = await storage.createAppUser({
        email,
        name: name || email.split("@")[0],
        googleId,
        authProvider: "google",
        avatarUrl: picture || null,
        plan: "free",
        status: "active",
        credits: 0,
        totalGenerations: 0,
      });
    }
  }

  if (!user) throw new Error("Error al crear/obtener usuario");

  if (user.status === "banned") {
    throw new Error("Tu cuenta ha sido suspendida");
  }

  await storage.updateAppUser(user.id, { lastLoginAt: new Date() } as any);
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function getCurrentUser(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await storage.getAppUser(payload.userId);
  if (!user) return null;

  return sanitizeUser(user);
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}
