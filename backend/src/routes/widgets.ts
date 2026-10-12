import { Router } from "express";
import { loadWidgetsConfig, saveWidgetsConfig } from "../widgets/store.js";
import { validateWidgetsConfig } from "../widgets/validate.js";

export const widgetsRouter = Router();

widgetsRouter.get("/", async (_req, res) => {
  try {
    const widgetsConfig = await loadWidgetsConfig();
    res.json(widgetsConfig);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

widgetsRouter.put("/", async (req, res) => {
  const result = validateWidgetsConfig(req.body);
  if (!result.ok) {
    res.status(400).json({ errors: result.errors });
    return;
  }

  try {
    await saveWidgetsConfig(result.config);
    res.json(result.config);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
