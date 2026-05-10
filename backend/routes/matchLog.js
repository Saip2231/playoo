import express from "express";
import db from "../services/couchdb.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/match-log", requireAuth, async (req, res) => {
  if (!req.body.match_id || !req.body.score) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const doc = {
      type: "match_log",
      player_id: req.user.id, // 🔥 real user ID
      match_id: req.body.match_id,
      score: req.body.score,
      note: req.body.note,
      created_at: new Date().toISOString()
    };

    const response = await db.insert(doc);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/player/:id/journal", requireAuth, async (req, res) => {
  try {
    const playerId = req.params.id;
    
    console.log("=== AUTH DEBUG ===");
    console.log("Requested Player ID (URL):", playerId);
    console.log("Actual Token User ID (Supabase):", req.user.id);
    console.log("Are they exactly equal?", playerId === req.user.id);

    if (playerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await db.find({
      selector: { player_id: playerId }
    });

    res.json(result.docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reviews", requireAuth, async (req, res) => {
  try {
    const { arena_id, rating, comment, match_id } = req.body;

    if (!arena_id || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const doc = {
      type: "review",
      player_id: req.user.id,
      arena_id,
      match_id,
      rating,
      comment: comment?.trim(),
      created_at: new Date().toISOString()
    };

    const response = await db.insert(doc);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
