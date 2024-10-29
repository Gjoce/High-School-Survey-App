const express = require("express");
const {
  getSessionById,
  createSession,
  deleteSession,
  getSessionsByAdmin,
  textAreaAnswers,
  getQuestionStatistics,
  getQuestionsForSessionId,
} = require("../../controllers/Admin/sessionController");
const authMiddleware = require("../../middleware/authMiddleware");
const {
  getSessionsById,
} = require("../../controllers/User/sessionsControllerUser");

const router = express.Router();

router.get("/specific/:id", authMiddleware, getSessionById);

router.get("/user/session/:id", getSessionsById);

router.post("/", authMiddleware, createSession);

router.delete("/:id", authMiddleware, deleteSession);

router.get("/admin", authMiddleware, getSessionsByAdmin);

router.get("/answers/:sejaId", authMiddleware, textAreaAnswers);

router.get("/questions/:id/statistics", authMiddleware, getQuestionStatistics);

router.get("/questions/:id", getQuestionsForSessionId);

module.exports = router;
