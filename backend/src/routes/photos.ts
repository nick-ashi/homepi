import { Router } from "express";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { config } from "../config.js";
import { loadWidgetsConfig } from "../widgets/store.js";
import { findWidgetSettings, type PhotosSettings } from "../widgets/types.js";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const photosRouter = Router();

function expandHome(folder: string): string {
  if (folder.startsWith("~")) {
    return path.join(os.homedir(), folder.slice(1));
  }
  return folder;
}

async function resolvePhotosFolder(): Promise<string> {
  const widgetsConfig = await loadWidgetsConfig();
  const settings = findWidgetSettings<PhotosSettings>(widgetsConfig, "photos");
  return path.resolve(expandHome(settings?.folder ?? config.photosDir));
}

photosRouter.get("/", async (_req, res) => {
  try {
    const folder = await resolvePhotosFolder();
    const entries = await fs.readdir(folder);
    const images = entries.filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()));

    const photos = await Promise.all(
      images.map(async (name) => {
        const stat = await fs.stat(path.join(folder, name));
        return {
          url: `/api/photos/files/${encodeURIComponent(name)}`,
          name,
          takenAt: stat.mtime.toISOString(),
        };
      }),
    );

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Serves one file by name from the configured folder - not express.static,
// since the folder is user-configurable and we need to reject traversal
// (../, absolute paths disguised as a filename) ourselves.
photosRouter.get("/files/:name", async (req, res) => {
  try {
    const folder = await resolvePhotosFolder();
    const filePath = path.resolve(folder, req.params.name);

    if (!filePath.startsWith(folder + path.sep)) {
      res.status(400).send("Invalid file path");
      return;
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
