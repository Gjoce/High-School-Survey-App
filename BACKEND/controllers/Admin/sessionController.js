const db = require("../../config/database");
const jwt = require("jsonwebtoken");

const getSessionById = async (req, res) => {
  const { id } = req.params;

  if (!req.allowedSessions || !req.allowedSessions.includes(Number(id))) {
    return res.status(403).json({ message: "Dostop do te seje ni dovoljen." });
  }

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

const createSession = async (req, res) => {
  const { naziv, vnos } = req.body;

  if (!req.userId) {
    return res.status(403).json({ message: "Dostop ni dovoljen." });
  }

  try {
    let sejaID;
    await db.transaction(async (trx) => {
      const insertedSeja = await trx("seja").insert({
        naziv: naziv,
        datum_kreacije: db.fn.now(),
        admin_id: req.userId,
      });
      sejaID = insertedSeja[0];

      if (!sejaID) {
        throw new Error("Failed to retrieve the session ID.");
      }

      for (const sklop of vnos) {
        const [sklopId] = await trx("sklop").insert({
          stevilka_sklopa: sklop.stevilka_sklopa,
          naziv: sklop.naziv,
          seja_id: sejaID,
        });

        for (const vprasanje of sklop.vprasanja) {
          const pravilenOdgovor = Array.isArray(vprasanje.pravilen_odgovor)
            ? vprasanje.pravilen_odgovor.join(", ")
            : vprasanje.pravilen_odgovor;

          await trx("vprasanja").insert({
            stevilo_naloge: vprasanje.stevilo_naloge,
            navodilo_naloge: vprasanje.navodilo_naloge,
            tip_vprasanja: vprasanje.tip_vprasanja,
            moznosti: vprasanje.moznosti,
            zgradiGraf: vprasanje.zgradiGraf,
            zgradiGrafSpol: vprasanje.zgradiGrafSpol,
            pravilen_odgovor: pravilenOdgovor,
            sklop_id: sklopId,
          });
        }
      }
    });

    // Decode the current JWT and append new session
    const currentToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(currentToken, process.env.JWT_SECRET);
    const updatedSessionData = {
      ...decoded,
      sessions: [...(decoded.sessions || []), sejaID],
    };

    // Sign a new token without changing 'exp'
    const newToken = jwt.sign(updatedSessionData, process.env.JWT_SECRET);

    res
      .status(201)
      .json({ message: "Session created successfully", token: newToken });
  } catch (error) {
    console.error("Error inserting data:", error.message);
    res
      .status(500)
      .json({ message: "Error inserting data", error: error.message });
  }
};

const getSessionsByAdmin = async (req, res) => {
  try {
    console.log("Admin ID:", req.userId);
    const sessions = await db("seja").select("*").where("admin_id", req.userId);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Napaka pri sprejemanju sej." });
  }
};

// Delete session by ID
const deleteSession = async (req, res) => {
  const { id } = req.params;

  // Check if the session belongs to the user attempting to delete it
  const session = await db("seja").where("id", id).first();
  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  if (session.admin_id !== req.userId) {
    return res.status(403).json({ message: "Dostop do te seje ni dovoljen." });
  }

  try {
    await db("seja").where("id", id).del();
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Error deleting session" });
  }
};

const textAreaAnswers = async (req, res) => {
  const sejaId = req.params.sejaId;

  try {
    const results = await db("odgovor")
      .join("vprasanja", "odgovor.vprasanja_id", "=", "vprasanja.id")
      .join("sklop", "vprasanja.sklop_id", "=", "sklop.id")
      .where("sklop.seja_id", sejaId)
      .andWhere("vprasanja.tip_vprasanja", "text-area")
      .select(
        "vprasanja.navodilo_naloge as question",
        "odgovor.Kaj_je_odgovor as answer",
        "odgovor.nickname"
      );

    const groupedResults = results.reduce((acc, row) => {
      if (!acc[row.question]) {
        acc[row.question] = [];
      }
      acc[row.question].push({ nickname: row.nickname, answer: row.answer });
      return acc;
    }, {});

    const response = Object.keys(groupedResults).map((question) => ({
      question,
      answers: groupedResults[question],
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching text-area answers:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

const getQuestionStatistics = async (req, res) => {
  const { id: questionId } = req.params;
  try {
    const question = await db("vprasanja")
      .select("tip_vprasanja", "moznosti", "zgradiGrafSpol")
      .where("id", questionId)
      .first();

    if (!question) {
      return res
        .status(404)
        .json({ message: "No question found with the given ID" });
    }

    let statistics = [];
    const zgradiGrafSpol = question.zgradiGrafSpol;

    if (question.tip_vprasanja === "highlight-text") {
      if (zgradiGrafSpol) {
        statistics = await db("odgovor")
          .select("Kaj_je_odgovor as odgovor", "spol")
          .count("* as total_answers")
          .where("vprasanja_id", questionId)
          .whereNot("Kaj_je_odgovor", "")
          .groupBy("Kaj_je_odgovor", "spol");
      } else {
        statistics = await db("odgovor")
          .select("Kaj_je_odgovor as odgovor")
          .count("* as total_answers")
          .where("vprasanja_id", questionId)
          .whereNot("Kaj_je_odgovor", "")
          .groupBy("Kaj_je_odgovor")
          .orderBy("total_answers", "desc")
          .limit(5);
      }
    } else {
      if (zgradiGrafSpol) {
        statistics = await db("odgovor")
          .select("Kaj_je_odgovor as odgovor", "spol")
          .count("* as total_answers")
          .where("vprasanja_id", questionId)
          .whereNot("Kaj_je_odgovor", "")
          .groupBy("Kaj_je_odgovor", "spol");
      } else {
        statistics = await db("odgovor")
          .select("Kaj_je_odgovor as odgovor")
          .count("* as total_answers")
          .where("vprasanja_id", questionId)
          .whereNot("Kaj_je_odgovor", "")
          .groupBy("Kaj_je_odgovor");
      }
    }

    res.json({ statistics, choices: [question], zgradiGrafSpol });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching statistics", error: error.message });
  }
};

const getQuestionsForSessionId = async (req, res) => {
  const { id } = req.params; // 'id' instead of 'sklopId'

  try {
    const questions = await db("vprasanja").where("sklop_id", id); // Use 'id' here
    res.json(questions);
  } catch (error) {
    console.error("Napaka pri prevzemu vprasanj:", error);
    res.status(500).json({ message: "Napaka pri prevzemu vprasanj" });
  }
};

module.exports = {
  getSessionById,
  createSession,
  deleteSession,
  getSessionsByAdmin,
  textAreaAnswers,
  getQuestionStatistics,
  getQuestionsForSessionId,
};
