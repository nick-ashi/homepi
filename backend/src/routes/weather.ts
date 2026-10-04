import { Router } from "express";
import { config } from "../config.js";

export const weatherRouter = Router();

// Open-Meteo requires no API key, which keeps setup simple for now.
weatherRouter.get("/", async (_req, res) => {
  try {
    const params = new URLSearchParams({
      latitude: String(config.weather.latitude),
      longitude: String(config.weather.longitude),
      current: "temperature_2m,weather_code",
      temperature_unit: "fahrenheit",
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }

    const data = await response.json();
    res.json(data.current);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
