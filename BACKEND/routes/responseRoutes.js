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
