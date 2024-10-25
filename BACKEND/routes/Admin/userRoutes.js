// routes/userRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getUserById,
} = require("../../controllers/userController"); // Import your user controller

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to login a user
router.post("/login", loginUser);

// Route to get user by ID
router.get("/:id", getUserById);

module.exports = router;
