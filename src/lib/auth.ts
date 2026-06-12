import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "changez-moi-en-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  membreId: string;
  role: string;
  email: string;
}

export async function hashMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, 10);
}

export async function verifierMotDePasse(
  motDePasse: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

export function genererToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifierToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
