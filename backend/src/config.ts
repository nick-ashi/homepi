import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  photosDir: required("PHOTOS_DIR", "./photos"),
  weather: {
    latitude: Number(process.env.WEATHER_LAT ?? 0),
    longitude: Number(process.env.WEATHER_LON ?? 0),
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    redirectUri: process.env.SPOTIFY_REDIRECT_URI ?? "http://127.0.0.1:3001/api/spotify/callback",
  },
  tokenStorePath: process.env.TOKEN_STORE_PATH ?? "./data/spotify-tokens.json",
  widgetsConfigPath: process.env.WIDGETS_CONFIG_PATH ?? "./data/widgets.json",
};
