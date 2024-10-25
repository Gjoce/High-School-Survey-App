const express = require("express");
const router = express.Router();
const {
  exportResponsesToExcel,
  getLeaderboard,
  calculateAverageSlider,
  shraniOdgovor,
  getUserPoints,
} = require("../controllers/responseController"); // Adjust the path as necessary
const authMiddleware = require("../middleware/authMiddleware");

// Route for exporting 'odgovor' table data to Excel by session ID
router.get("/export/:sessionId", authMiddleware, exportResponsesToExcel);

// Route for getting leaderboard by session ID
router.get("/leaderboard/:sessionId", authMiddleware, getLeaderboard);

// Route for calculating average slider response for a session and question type
router.get(
  "/average-slider/:sessionId/:questionType",
  authMiddleware,
  calculateAverageSlider
);

// Route for saving a user's response
router.post("/save-response", shraniOdgovor);

// Route for getting total points of a specific user
router.get("/points/:sifra_dijaka", getUserPoints);

module.exports = router;
