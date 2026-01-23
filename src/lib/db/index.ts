import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const usersFilePath = path.join(process.cwd(), "src/lib/db/users.json");

export interface User {
  id: string;
  username?: string;
  email: string;
  password?: string; // hashed
  name?: string;
  image?: string;
  emailVerified?: Date;
  provider: "credentials" | "google";
  providerId?: string; // for OAuth providers
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: string;
}

// Read users from file
export function getUsers(): User[] {
  try {
    // Ensure directory exists
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If file doesn't exist, create it with empty array
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(usersFilePath, "utf-8");
    if (!data || data.trim() === "") {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

// Write users to file
export function saveUsers(users: User[]): void {
  try {
    // Ensure directory exists
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
}

// User operations
export async function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User> {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Hash password if provided
  if (newUser.password) {
    newUser.password = await bcrypt.hash(newUser.password, 10);
  }

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserByUsername(username: string): User | undefined {
  const users = getUsers();
  return users.find(
    (user) => user.username?.toLowerCase() === username.toLowerCase()
  );
}

export function getUserByEmailOrUsername(identifier: string): User | undefined {
  try {
    const users = getUsers();
    if (!Array.isArray(users)) {
      console.error("Users is not an array:", users);
      return undefined;
    }
    return users.find(
      (user) =>
        user?.email?.toLowerCase() === identifier.toLowerCase() ||
        user?.username?.toLowerCase() === identifier.toLowerCase()
    );
  } catch (error) {
    console.error("Error in getUserByEmailOrUsername:", error);
    return undefined;
  }
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find((user) => user.id === id);
}

export function getUserByProviderId(
  provider: string,
  providerId: string
): User | undefined {
  const users = getUsers();
  return users.find(
    (user) => user.provider === provider && user.providerId === providerId
  );
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | null> {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) return null;

  // Hash password if being updated
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);
  return users[userIndex];
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Password reset tokens (in-memory for simplicity, should use database in production)
const resetTokens = new Map<string, PasswordResetToken>();

export function createPasswordResetToken(userId: string): string {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  resetTokens.set(token, {
    userId,
    token,
    expiresAt,
  });

  return token;
}

export function getPasswordResetToken(
  token: string
): PasswordResetToken | undefined {
  const resetToken = resetTokens.get(token);
  if (!resetToken) return undefined;

  // Check if expired
  if (new Date(resetToken.expiresAt) < new Date()) {
    resetTokens.delete(token);
    return undefined;
  }

  return resetToken;
}

export function deletePasswordResetToken(token: string): void {
  resetTokens.delete(token);
}
