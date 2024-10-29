const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Manjka avtentikacijski token." });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Nepravilen format avtentikacijskega tokena." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.allowedSessions = decoded.sessions;

    const sessionId = req.params.sessionId;

    if (!req.allowedSessions || !Array.isArray(req.allowedSessions)) {
      return res
        .status(403)
        .json({ message: "Dostop do te seje ni dovoljen." });
    }

    if (sessionId && !req.allowedSessions.includes(Number(sessionId))) {
      return res
        .status(403)
        .json({ message: "Dostop do te seje ni dovoljen." });
    }

    next();
  } catch (error) {
    console.error("Napaka pri preverjanju tokena:", error);
    res.status(401).json({ message: "Neveljaven ali pretečen token." });
  }
};

module.exports = authMiddleware;
