// routes/sessionRoutes.js
const express = require("express");
const {
  getSessionById,
  createSession,
  deleteSession,
  getSessionsByAdmin,
  textAreaAnswers,
  getQuestionStatistics,
  getQuestionsForSessionId,
} = require("../../controllers/Admin/sessionController"); // Import your session controller
const authMiddleware = require("../../middleware/authMiddleware");
const {
  getSessionsById,
} = require("../../controllers/User/sessionsControllerUser");

const router = express.Router();

// Route to get a session by ID
router.get("/specific/:id", authMiddleware, getSessionById);

// Route to get a session by ID
router.get("/user/session/:id", getSessionsById);

// Route to create a new session
router.post("/", authMiddleware, createSession);

// Route to delete a session by ID
router.delete("/:id", authMiddleware, deleteSession);

// Route to get all sessions for a specific admin
router.get("/admin", authMiddleware, getSessionsByAdmin);

// Route to get text-area answers for a specific session
router.get("/answers/:sejaId", authMiddleware, textAreaAnswers);

// Route to get statistics for a specific question
router.get("/questions/:id/statistics", authMiddleware, getQuestionStatistics); // Add this line
// Route to get a all questions for session ID
router.get("/questions/:id", getQuestionsForSessionId);

module.exports = router;
