import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { spotifyRouter } from "./routes/spotify.js";
import { photosRouter } from "./routes/photos.js";
import { weatherRouter } from "./routes/weather.js";
import { widgetsRouter } from "./routes/widgets.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use("/api/spotify", spotifyRouter);
app.use("/api/photos", photosRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/widgets", widgetsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`homepi backend listening on http://localhost:${config.port}`);
});
