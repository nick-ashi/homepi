import { Router } from "express";
import { 
  buildAuthorizeUrl, 
  exchangeCodeForTokens, 
  getNowPlaying, 
  playTrack, 
  pauseTrack, 
  skipToNextTrack, 
  skipToPreviousTrack 
} from "../spotify/client.js";

export const spotifyRouter = Router();

// One-time manual login flow: visit this in a browser once, log in, and the
// backend stores a refresh token so the Pi never needs a keyboard again.
spotifyRouter.get("/login", (_req, res) => {
  const state = Math.random().toString(36).slice(2);
  res.redirect(buildAuthorizeUrl(state));
});

spotifyRouter.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (typeof code !== "string") {
    res.status(400).send("Missing authorization code");
    return;
  }

  try {
    await exchangeCodeForTokens(code);
    res.send("Spotify connected. You can close this tab.");
  } catch (err) {
    res.status(500).send(`Spotify auth failed: ${(err as Error).message}`);
  }
});

spotifyRouter.get("/now-playing", async (_req, res) => {
  try {
    const nowPlaying = await getNowPlaying();
    res.json(nowPlaying);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

spotifyRouter.post("/skip-to-next", async (_req, res) => {
  try {
    await skipToNextTrack();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

spotifyRouter.post("/skip-to-previous", async (_req, res) => {
  try {
    await skipToPreviousTrack();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
})

spotifyRouter.put("/play-track", async (_req, res) => {
  try {
    await playTrack();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
})

spotifyRouter.put("/pause-track", async (_req, res) => {
  try {
    await pauseTrack();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
})
