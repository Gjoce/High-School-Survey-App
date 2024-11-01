const express = require("express");
const router = express.Router();
const {
  exportResponsesToExcel,
  getLeaderboard,
  calculateAverageSlider,
  shraniOdgovor,
  getUserPoints,
} = require("../controllers/responseController");
const authMiddleware = require("../middleware/authMiddleware");

// In-memory store for allowed states (can also use a database)
const allowedStates = {};

// Route to set the allowed state for a question
router.post("/allow-continuation", authMiddleware, (req, res) => {
  const { questionId, allowed } = req.body;
  allowedStates[questionId] = allowed; // Store the allowed state
  res.sendStatus(200); // Respond with success
});

// Route to check if a question is allowed
router.get("/allowed/:questionId", authMiddleware, (req, res) => {
  const questionId = req.params.questionId;
  const allowed = allowedStates[questionId] || false; // Default to false if not set
  res.json({ allowed });
});

router.get("/export/:sessionId", authMiddleware, exportResponsesToExcel);
router.get("/leaderboard/:sessionId", authMiddleware, getLeaderboard);
router.get(
  "/average-slider/:sessionId/:questionType",
  authMiddleware,
  calculateAverageSlider
);
router.post("/save-response", shraniOdgovor);
router.get("/points/:sifra_dijaka", getUserPoints);

module.exports = router;
