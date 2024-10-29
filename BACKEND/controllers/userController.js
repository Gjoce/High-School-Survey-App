const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { email, geslo } = req.body;
  try {
    const hashedGeslo = await bcrypt.hash(geslo, 10);
    const [userId] = await db("admin")
      .insert({ email, geslo: hashedGeslo })
      .returning("id");
    res.status(201).json({ id: userId, email });
  } catch (error) {
    console.error("Napaka pri registraciji:", error);
    res.status(500).json({ message: "Napaka pri registraciji" });
  }
};

const loginUser = async (req, res) => {
  const { email, geslo } = req.body;

  try {
    const user = await db("admin").where({ email }).first();
    if (user) {
      const isMatching = await bcrypt.compare(geslo, user.geslo);

      if (isMatching) {
        const sessions = await db("seja")
          .where({ admin_id: user.id })
          .select("id");
        const sessionIds = sessions.map((session) => session.id);

        const token = jwt.sign(
          { id: user.id, email: user.email, sessions: sessionIds },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(200).json({
          message: "Uspešna prijava",
          token,
        });
      }
    }
    res.status(401).json({ message: "Neveljaven username ali password" });
  } catch (err) {
    console.error("Napaka v prijavi:", err);
    res.status(500).json({ message: "Napaka v prijavi" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db("admin").where("id", id).first();
    if (!user) {
      return res.status(404).json({ message: "Uporabnik ni bil najden" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Napaka pri sprejemu uporabnika:", error);
    res.status(500).json({ message: "Napaka pri sprejemu uporabnika" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
