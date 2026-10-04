import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config.js";

interface StoredTokens {
  refreshToken: string;
}

export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const dir = path.dirname(config.tokenStorePath);
  await fs.mkdir(dir, { recursive: true });
  const data: StoredTokens = { refreshToken };
  await fs.writeFile(config.tokenStorePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadRefreshToken(): Promise<string | null> {
  try {
    const raw = await fs.readFile(config.tokenStorePath, "utf-8");
    const data = JSON.parse(raw) as StoredTokens;
    return data.refreshToken ?? null;
  } catch {
    return null;
  }
}
