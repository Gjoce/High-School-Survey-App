const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
const registerUser = async (req, res) => {
  const { email, geslo } = req.body;
  try {
    const hashedGeslo = await bcrypt.hash(geslo, 10); // Hash password with salt rounds
    const [userId] = await db("admin")
      .insert({ email, geslo: hashedGeslo })
      .returning("id");
    res.status(201).json({ id: userId, email });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

const loginUser = async (req, res) => {
  const { email, geslo } = req.body;

  try {
    const user = await db("admin").where({ email }).first();
    if (user) {
      const isMatching = await bcrypt.compare(geslo, user.geslo);

      if (isMatching) {
        // Fetch allowed session IDs for the admin
        const sessions = await db("seja")
          .where({ admin_id: user.id })
          .select("id");
        const sessionIds = sessions.map((session) => session.id);

        // Create JWT token with session information
        const token = jwt.sign(
          { id: user.id, email: user.email, sessions: sessionIds }, // Include sessions in the payload
          process.env.JWT_SECRET,
          { expiresIn: "1h" } // Set expiration as desired
        );

        return res.status(200).json({
          message: "Uspešna prijava",
          token, // Send token in response
        });
      }
    }
    res.status(401).json({ message: "Neveljaven username ali password" });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Napaka v prijavi" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db("admin").where("id", id).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
