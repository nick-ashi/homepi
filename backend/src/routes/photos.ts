import { Router } from "express";
import { promises as fs } from "node:fs";
import { config } from "../config.js";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const photosRouter = Router();

photosRouter.get("/", async (_req, res) => {
  try {
    const entries = await fs.readdir(config.photosDir);
    const images = entries.filter((name) =>
      IMAGE_EXTENSIONS.has(name.slice(name.lastIndexOf(".")).toLowerCase()),
    );
    res.json(images.map((name) => `/photos/files/${encodeURIComponent(name)}`));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
