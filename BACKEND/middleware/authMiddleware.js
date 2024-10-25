const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for authorization header
  if (!authHeader) {
    return res.status(401).json({ message: "Manjka avtentikacijski token." });
  }

  // Check for Bearer token format
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Nepravilen format avtentikacijskega tokena." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to request
    req.allowedSessions = decoded.sessions; // Attach allowed sessions to the request

    // Log the decoded JWT for debugging
    console.log("Decoded JWT:", decoded);

    // Extract sessionId from request parameters
    const sessionId = req.params.sessionId; // Make sure this matches your route parameter

    // Check if allowedSessions is valid
    if (!req.allowedSessions || !Array.isArray(req.allowedSessions)) {
      return res
        .status(403)
        .json({ message: "Dostop do te seje ni dovoljen." });
    }

    // Verify if the requested session is among the allowed sessions
    if (sessionId && !req.allowedSessions.includes(Number(sessionId))) {
      return res
        .status(403)
        .json({ message: "Dostop do te seje ni dovoljen." });
    }

    // If everything is valid, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Napaka pri preverjanju tokena:", error);
    res.status(401).json({ message: "Neveljaven ali pretečen token." });
  }
};

module.exports = authMiddleware;
