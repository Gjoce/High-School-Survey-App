google.charts.load("current", { packages: ["bar"] });
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {
  const urlParams = new URLSearchParams(window.location.search);
  const questionId = urlParams.get("id");

  if (!questionId) {
    console.error("Question ID not found in URL");
    return;
  }

  try {
    const token = window.sessionStorage.getItem("jwt");
    const response = await fetch(
      `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/sessions/questions/${questionId}/statistics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const dataFromServer = await response.json();

    console.log("Data from server:", dataFromServer);

    const data = new google.visualization.DataTable();
    const question = dataFromServer.choices[0];
    const zgradiGrafSpol = question.zgradiGrafSpol;

    data.addColumn("string", "Odgovor");

    function formatLabel(label) {
      const maxLength = 20;
      if (label.length > maxLength) {
        const words = label.split(" ");
        let newLabel = "";
        let lineLength = 0;

        words.forEach((word) => {
          if (lineLength + word.length > maxLength) {
            newLabel += "\n" + word;
            lineLength = word.length;
          } else {
            newLabel += (lineLength > 0 ? " " : "") + word;
            lineLength += word.length;
          }
        });
        return newLabel;
      } else {
        return label;
      }
    }

    if (zgradiGrafSpol) {
      data.addColumn("number", "Moški");
      data.addColumn("number", "Ženski");
      data.addColumn("number", "Drugo");

      const genderStats = { 0: "Moški", 1: "Ženski", 2: "Drugo" };
      const statsMap = {};

      const choices = question.moznosti
        .split("•")
        .map((choice) => choice.trim())
        .filter((choice) => choice !== "");
      choices.forEach(
        (choice) => (statsMap[choice] = { Moški: 0, Ženski: 0, Drugo: 0 })
      );

      dataFromServer.statistics.forEach((row) => {
        if (!statsMap[row.odgovor]) {
          statsMap[row.odgovor] = { Moški: 0, Ženski: 0, Drugo: 0 };
        }
        statsMap[row.odgovor][genderStats[row.spol]] = row.total_answers;
      });

      Object.keys(statsMap).forEach((key) => {
        data.addRow([
          formatLabel(key),
          statsMap[key].Moški,
          statsMap[key].Ženski,
          statsMap[key].Drugo,
        ]);
      });
    } else {
      data.addColumn("number", "Skupno število odgovorov");

      if (question.tip_vprasanja === "highlight-text") {
        dataFromServer.statistics.forEach((row) => {
          data.addRow([formatLabel(row.odgovor), row.total_answers]);
        });
      } else {
        const choices = question.moznosti
          .split("•")
          .map((choice) => choice.trim())
          .filter((choice) => choice !== "");
        choices.forEach((choice) => data.addRow([formatLabel(choice), 0]));

        dataFromServer.statistics.forEach((row) => {
          const choiceIndex = choices.findIndex(
            (choice) => choice === row.odgovor
          );
          if (choiceIndex !== -1) {
            data.setValue(choiceIndex, 1, row.total_answers);
          }
        });
      }
    }

    const maxAnswers = Math.max(
      ...dataFromServer.statistics.map((row) => row.total_answers),
      0
    );

    const ticks = Array.from({ length: maxAnswers + 1 }, (_, i) => i);

    const options = {
      chart: {
        title: "Statistika odgovorov",
        subtitle: "Skupno število odgovorov za vsako izbiro",
      },
      vAxis: {
        viewWindow: {
          min: 0,
          max: maxAnswers,
        },
        ticks: ticks,
        format: "0",
      },
      hAxis: {
        textPosition: "out",
        textStyle: {
          fontSize: 12,
        },
        slantedText: true,
        slantedTextAngle: 45,
      },
      bars: "vertical",
      bar: { groupWidth: "75%" },
      legend: { position: zgradiGrafSpol ? "top" : "none" },
    };

    const chart = new google.charts.Bar(
      document.getElementById("columnchart_material")
    );
    chart.draw(data, google.charts.Bar.convertOptions(options));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
