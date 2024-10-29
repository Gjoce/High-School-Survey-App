const db = require("../config/database");

const ExcelJS = require("exceljs");

const exportResponsesToExcel = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const odgovorData = await db("odgovor")
      .join("vprasanja", "odgovor.vprasanja_id", "vprasanja.id")
      .where("odgovor.seja_id", sessionId)
      .select("odgovor.*", "vprasanja.navodilo_naloge");

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

      if (!transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id]) {
        transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id] = [];
      }

      transformedData[row.sifra_dijaka].odgovori[row.vprasanja_id].push(
        row.Kaj_je_odgovor
      );

      questionsSet.add(row.vprasanja_id);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Odgovor Data");

    const columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Sifra Dijaka", key: "sifra_dijaka", width: 15 },
      { header: "Spol", key: "spol", width: 10 },
      { header: "Vzdevek", key: "nickname", width: 20 },
      { header: "Seja ID", key: "seja_id", width: 15 },
    ];

    const questionColumns = Array.from(questionsSet).map((questionId) => {
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

    worksheet.columns = columns.concat(questionColumns);

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

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=odgovor_data.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Napaka pri shranjevanju odgovorov v Excel:", error);
    res
      .status(500)
      .json({ message: "Napaka pri shranjevanju odgovorov v Excel" });
  }
};

const getLeaderboard = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const usersData = await db("odgovor")
      .where("seja_id", sessionId)
      .select("sifra_dijaka", "nickname", "skupneTocke");

    if (usersData.length === 0) {
      console.log(`Podatki niso bili najdeni za sejo: ${sessionId}`);
      return res
        .status(404)
        .json({ message: "Podatki niso bili najdeni za sejo" });
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
    console.error("Napaka pri sprejemanju leaderboard podatkov:", error);
    res
      .status(500)
      .json({ message: "Napaka pri sprejemanju leaderboard podatkov" });
  }
};

const calculateAverageSlider = async (req, res) => {
  const { sessionId, questionType } = req.params;

  try {
    const answers = await db("odgovor")
      .select("Kaj_je_odgovor")
      .where({
        seja_id: sessionId,
      })
      .whereIn(
        "vprasanja_id",
        db("vprasanja").select("id").where("tip_vprasanja", questionType)
      );

    if (answers.length === 0) {
      return res.status(404).json({
        message: "Ni odgovorov",
      });
    }

    const total = answers.reduce(
      (sum, answer) => sum + parseFloat(answer.Kaj_je_odgovor),
      0
    );
    const average = (total / answers.length).toFixed(1);

    res.json({ average });
  } catch (error) {
    console.error("Napaka pri izračunu povprečja:", error);
    res.status(500).json({ message: "Napaka pri izračunu povprečja" });
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

        points = correctCount * 0.5;
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

        points = correctCount * 1;
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

    let user = await db("odgovor").where("sifra_dijaka", sifra_dijaka).first();
    if (!user) {
      await db("odgovor").insert({
        sifra_dijaka,
        skupneTocke: points,
        spol,
        nickname,
        Kaj_je_odgovor: "",
        vprasanja_id,
        Odgovor: points,
        seja_id: sessionId,
      });
      user = { skupneTocke: points };
    } else if (isCorrect) {
      const newTotalPoints = user.skupneTocke + points;
      await db("odgovor").where("sifra_dijaka", sifra_dijaka).update({
        skupneTocke: newTotalPoints,
      });
      user.skupneTocke = newTotalPoints;
    }

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
            seja_id: sessionId,
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
        seja_id: sessionId,
      });
    }

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
    const user = await db("odgovor")
      .where("sifra_dijaka", req.params.sifra_dijaka)
      .first();

    if (!user) {
      return res.status(404).json({ error: "Uporabnik ni bil najden" });
    }

    const totalPoints = user.skupneTocke;

    res.status(200).json({ points: totalPoints });
  } catch (error) {
    console.error("Napaka pri sprejemu uporabnikove točke:", error);
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
