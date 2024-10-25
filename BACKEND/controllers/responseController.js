const db = require("../config/database");

const ExcelJS = require("exceljs");

// Fetch and export 'odgovor' table data to Excel
const exportResponsesToExcel = async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Fetch data from the database, joining with questions table to get question text
    const odgovorData = await db("odgovor")
      .join("vprasanja", "odgovor.vprasanja_id", "vprasanja.id")
      .where("odgovor.seja_id", sessionId)
      .select("odgovor.*", "vprasanja.navodilo_naloge"); // Assuming 'navodilo_naloge' is the column for question text

    // Transform data to group answers by user and question
    const transformedData = {};
    const questionsSet = new Set();

    odgovorData.forEach((row) => {
      if (!transformedData[row.sifra_dijaka]) {
        transformedData[row.sifra_dijaka] = {
          id: row.id,
          sifra_dijaka: row.sifra_dijaka,
          spol: row.spol,
          nickname: row.nickname,
          seja_id: row.seja_id,
          odgovori: {},
        };
      }

      // Initialize array for checkbox and highlight answers if not already initialized
      if (!transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id]) {
        transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id] = [];
      }

      // Push the answer to the respective question
      transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id].push(
        row.Kaj_je_odgovor
      );

      questionsSet.add(row.vprasanja_id);
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Odgovor Data");

    // Define static columns
    const columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Sifra Dijaka", key: "sifra_dijaka", width: 15 },
      { header: "Spol", key: "spol", width: 10 },
      { header: "Vzdevek", key: "nickname", width: 20 },
      { header: "Seja ID", key: "seja_id", width: 15 },
    ];

    // Define dynamic columns for each question
    const questionColumns = Array.from(questionsSet).map((questionId) => {
      // Find the corresponding question object based on questionId in odgovorData
      const question = odgovorData.find((q) => q.vprasanja_id === questionId);
      if (question && question.navodilo_naloge) {
        return {
          header: `${question.navodilo_naloge}`,
          key: `question_${questionId}`,
          width: 30,
        };
      } else {
        return {
          header: `Vprašanje ${questionId}`,
          key: `question_${questionId}`,
          width: 30,
        };
      }
    });

    // Set columns to worksheet
    worksheet.columns = columns.concat(questionColumns);

    // Add rows to the worksheet
    Object.values(transformedData).forEach((user) => {
      const row = {
        id: user.id,
        sifra_dijaka: user.sifra_dijaka,
        spol: user.spol,
        nickname: user.nickname,
        seja_id: user.seja_id,
      };

      questionsSet.forEach((questionId) => {
        const odgovor = user.odgovori[questionId];
        if (Array.isArray(odgovor)) {
          row[`question_${questionId}`] = odgovor.join(" ");
        } else {
          row[`question_${questionId}`] = odgovor || "";
        }
      });

      worksheet.addRow(row);
    });

    // Set response headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=odgovor_data.xlsx"
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting odgovor data to Excel:", error);
    res.status(500).json({ message: "Error exporting odgovor data to Excel" });
  }
};

// Get leaderboard by session ID
const getLeaderboard = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const usersData = await db("odgovor")
      .where("seja_id", sessionId)
      .select("sifra_dijaka", "nickname", "skupneTocke");

    if (usersData.length === 0) {
      console.log(`No data found for session ID: ${sessionId}`);
      return res
        .status(404)
        .json({ message: "No data found for this session ID" });
    }

    const leaderboard = {};
    usersData.forEach((row) => {
      if (!leaderboard[row.sifra_dijaka]) {
        leaderboard[row.sifra_dijaka] = {
          sifra_dijaka: row.sifra_dijaka,
          nickname: row.nickname,
          skupneTocke: 0,
        };
      }
      leaderboard[row.sifra_dijaka].skupneTocke = row.skupneTocke;
    });

    const sortedLeaderboard = Object.values(leaderboard).sort(
      (a, b) => b.skupneTocke - a.skupneTocke
    );
    res.json(sortedLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ message: "Error fetching leaderboard data" });
  }
};

// Calculate average slider answer for a specific session and question type
const calculateAverageSlider = async (req, res) => {
  const { sessionId, questionType } = req.params; // Extract sessionId and questionType from URL

  try {
    // Fetch answers for the specific session and question type
    const answers = await db("odgovor")
      .select("Kaj_je_odgovor")
      .where({
        seja_id: sessionId, // Fetching answers for the specific session
      })
      .whereIn(
        "vprasanja_id",
        db("vprasanja").select("id").where("tip_vprasanja", questionType)
      ); // Use extracted question type

    console.log(`Session ID: ${sessionId}, Question Type: ${questionType}`);
    console.log(`Fetched answers: ${JSON.stringify(answers)}`);

    if (answers.length === 0) {
      return res
        .status(404)
        .json({
          message: "No answers found for this session and question type",
        });
    }

    // Calculate the average, parsing each Kaj_je_odgovor as a float
    const total = answers.reduce(
      (sum, answer) => sum + parseFloat(answer.Kaj_je_odgovor),
      0
    );
    const average = (total / answers.length).toFixed(1); // Calculate average

    res.json({ average });
  } catch (error) {
    console.error("Error calculating average:", error);
    res
      .status(500)
      .json({ message: "An error occurred while calculating the average" });
  }
};

const shraniOdgovor = async (req, res) => {
  try {
    const {
      sifra_dijaka,
      Kaj_je_odgovor,
      vprasanja_id,
      nickname,
      spol,
      sessionId,
    } = req.body;

    let isCorrect = false;
    let points = 0.0;

    const question = await db("vprasanja").where("id", vprasanja_id).first();
    console.log("Fetched question:", question);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.tip_vprasanja === "text-area") {
      isCorrect = Kaj_je_odgovor.trim() !== "";
      if (isCorrect) {
        points = 2;
      }
    } else if (question.tip_vprasanja === "radio-button") {
      isCorrect = question.pravilen_odgovor.includes(Kaj_je_odgovor);
      if (isCorrect) {
        points = 2;
      }
    } else if (question.tip_vprasanja === "check-box") {
      if (Kaj_je_odgovor.length > 0) {
        const correctAnswers = question.pravilen_odgovor
          .split(", ")
          .map((answer) => answer.trim());
        const userAnswers = Kaj_je_odgovor.map((answer) => answer.trim());
        isCorrect = userAnswers.every((answer) =>
          correctAnswers.includes(answer)
        );
        let correctCount = 0;
        userAnswers.forEach((answer) => {
          if (correctAnswers.includes(answer)) {
            correctCount += 1;
          }
        });

        points = correctCount * 0.5; // Each correct checkbox is 0.5 points
      }
    } else if (question.tip_vprasanja === "check-box2") {
      if (Kaj_je_odgovor.length > 0) {
        const correctAnswers = question.pravilen_odgovor
          .split(", ")
          .map((answer) => answer.trim());
        const userAnswers = Kaj_je_odgovor.map((answer) => answer.trim());
        isCorrect = userAnswers.every((answer) =>
          correctAnswers.includes(answer)
        );
        let correctCount = 0;
        userAnswers.forEach((answer) => {
          if (correctAnswers.includes(answer)) {
            correctCount += 1;
          }
        });

        points = correctCount * 1; // Each correct checkbox is 0.5 points
      }
    } else if (question.tip_vprasanja === "highlight-text") {
      const correctPortions = question.pravilen_odgovor.split(", ");
      isCorrect = correctPortions.every((portion) =>
        Kaj_je_odgovor.includes(portion)
      );
      if (isCorrect) {
        points = 2;
      }
    } else if (question.tip_vprasanja === "slider") {
      const userAnswer = parseFloat(Kaj_je_odgovor);
      const minRange = 13.2;
      const maxRange = 16.2;
      isCorrect = userAnswer >= minRange && userAnswer <= maxRange;
      if (isCorrect) {
        points = 2;
      }
    } else if (question.tip_vprasanja === "slider2") {
      const userAnswer = parseFloat(Kaj_je_odgovor);
      const minRange = 7.9;
      const maxRange = 10.9;
      isCorrect = userAnswer >= minRange && userAnswer <= maxRange;
      if (isCorrect) {
        points = 2;
      }
    }
    // Retrieve current points for the user
    let user = await db("odgovor").where("sifra_dijaka", sifra_dijaka).first();
    if (!user) {
      // If user does not exist, create the user with initial points
      await db("odgovor").insert({
        sifra_dijaka,
        skupneTocke: points,
        spol, // Include missing field
        nickname, // Include missing field
        Kaj_je_odgovor: "", // Default value for answer
        vprasanja_id,
        Odgovor: points,
        seja_id: sessionId, // Store sessionID in seja_id
      });
      user = { skupneTocke: points };
    } else if (isCorrect) {
      // Update the user's total points
      const newTotalPoints = user.skupneTocke + points;
      await db("odgovor").where("sifra_dijaka", sifra_dijaka).update({
        skupneTocke: newTotalPoints,
      });
      user.skupneTocke = newTotalPoints;
    }

    // Insert the answer with cumulative points
    const cumulativePoints = user.skupneTocke;
    if (Array.isArray(Kaj_je_odgovor)) {
      await Promise.all(
        Kaj_je_odgovor.map(async (option) => {
          await db("odgovor").insert({
            sifra_dijaka,
            Kaj_je_odgovor: option,
            spol,
            nickname,
            vprasanja_id,
            Odgovor: points,
            skupneTocke: cumulativePoints,
            seja_id: sessionId, // Store sessionID in seja_id
          });
        })
      );
    } else {
      await db("odgovor").insert({
        sifra_dijaka,
        Kaj_je_odgovor,
        spol,
        nickname,
        vprasanja_id,
        Odgovor: points,
        skupneTocke: cumulativePoints,
        seja_id: sessionId, // Store sessionID in seja_id
      });
    }
    console.log(
      "User answer:",
      Kaj_je_odgovor,
      "isCorrect:",
      isCorrect,
      "Points:",
      points,
      "Total Points:",
      user.skupneTocke
    );

    res.status(200).json({
      message: "Odgovor je bil uspešno shranjen",
      isCorrect: isCorrect,
      points: points,
      totalPoints: user.skupneTocke,
    });
  } catch (error) {
    console.error("Napaka pri shrambi odgovora:", error);
    res.status(500).json({ error: "Napaka pri shrambi odgovora" });
  }
};

const getUserPoints = async (req, res) => {
  try {
    // Retrieve points for the specified user
    const user = await db("odgovor")
      .where("sifra_dijaka", req.params.sifra_dijaka)
      .first();

    if (!user) {
      // If user is not found, return 404
      return res.status(404).json({ error: "User not found" });
    }

    // Extract total points
    const totalPoints = user.skupneTocke;

    // Send the total points as JSON response
    res.status(200).json({ points: totalPoints });
  } catch (error) {
    console.error("Error fetching user points:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  exportResponsesToExcel,
  getLeaderboard,
  calculateAverageSlider,
  shraniOdgovor,
  getUserPoints,
};
