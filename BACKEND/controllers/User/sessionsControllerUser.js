const db = require("../../config/database");

const getSessionsById = async (req, res) => {
  const { id } = req.params;

  try {
    const seja = await db("seja").where("id", id).first();
    if (!seja) {
      console.log("Session not found:", id);
      return res.status(404).json({ message: "Session not found" });
    }

    const sklopi = await db("sklop").where("seja_id", id);

    const sklopiZVprasanji = await Promise.all(
      sklopi.map(async (sklop) => {
        const vprasanja = await db("vprasanja").where("sklop_id", sklop.id);
        return {
          ...sklop,
          vprasanja: vprasanja,
        };
      })
    );

    const response = {
      seja: seja,
      sklopi: sklopiZVprasanji,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Error fetching session" });
  }
};

module.exports = { getSessionsById };
