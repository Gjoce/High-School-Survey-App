$(document).ready(function () {
  const sessionId = sessionStorage.getItem("sessionID");
  const sklopId = sessionStorage.getItem("sklopID");
  const sifraDijaka = sessionStorage.getItem("sifraKviza");
  let currentQuestionIndex = sessionStorage.getItem("currentQuestionIndex")
    ? parseInt(sessionStorage.getItem("currentQuestionIndex"))
    : 0;
  let questions = [];

  const socket = new WebSocket("ws://localhost:3307");

  if (sessionId && sklopId) {
    fetch(`http://localhost:3307/api/sessions/questions/${sklopId}`)
      .then((response) => response.json())
      .then((data) => {
        questions = data;
        if (questions.length > 0) {
          displayQuestion(questions[currentQuestionIndex]);
        } else {
          console.error("No questions found for this sklop.");
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  } else {
    console.error("Session ID or Sklop ID not found in sessionStorage");
  }

  function displayQuestion(question) {
    const questionContainer = $("#question-container");
    questionContainer.empty();

    const questionElement = $("<div>").addClass("question-card");
    questionElement.append(
      $("<h3>").addClass("question-title").text(question.navodilo_naloge)
    );

    switch (question.tip_vprasanja) {
      case "radio-button":
        const radioOptions = (question.moznosti || "")
          .split("•")
          .filter((opt) => opt.trim() !== "");
        radioOptions.forEach((option) => {
          questionElement.append(`
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="options" value="${option.trim()}">
                            <label class="form-check-label">${option.trim()}</label>
                        </div>
                    `);
        });
        break;
      case "check-box":
        const checkOptions = (question.moznosti || "")
          .split("•")
          .filter((opt) => opt.trim() !== "");
        checkOptions.forEach((option) => {
          questionElement.append(`
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="options" value="${option.trim()}">
                            <label class="form-check-label">${option.trim()}</label>
                        </div>
                    `);
        });
        break;
      case "check-box2":
        const imageUrl = "../Slike/vprasanja.png";
        questionElement.append(`
                    <div class="image-container">
                        <img src="${imageUrl}" alt="Question Image" style="width: 100%; height: auto; margin-bottom: 20px;">
                    </div>
                `);

        const checkOptions2 = (question.moznosti || "")
          .split("•")
          .filter((opt) => opt.trim() !== "");
        checkOptions2.forEach((option) => {
          questionElement.append(`
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="options" value="${option.trim()}">
                            <label class="form-check-label">${option.trim()}</label>
                        </div>
                    `);
        });
        break;
      case "text-area":
        questionElement.append(
          '<textarea class="form-control" rows="3"></textarea>'
        );
        break;
      case "slider":
        const min = question.min || 1;
        const max = question.max || 20;
        const value = question.value || 10;
        const step = question.step || 0.1;
        const sliderContainer = $("<div>").addClass("slider-container");
        const slider = $(
          `<input type="range" class="form-control-range" min="${min}" max="${max}" step="${step}" value="${value}" id="slider">`
        );
        const sliderValue = $("<div>")
          .addClass("slider-value")
          .attr("id", "slider-value")
          .attr("value", value);
        slider.on("input", function () {
          sliderValue.text(this.value);
          sliderValue.attr("value", this.value);
        });
        sliderContainer.append(slider);
        sliderContainer.append(sliderValue);
        questionElement.append(sliderContainer);
        break;
      case "slider2":
        const min2 = question.min || 1;
        const max2 = question.max || 20;
        const value2 = question.value || 10;
        const step2 = question.step || 0.1;
        const sliderContainer2 = $("<div>").addClass("slider-container");
        const slider2 = $(
          '<input type="range" class="form-control-range" min="' +
            min2 +
            '" max="' +
            max2 +
            '" step="' +
            step2 +
            '" value="' +
            value2 +
            '" id="slider2">'
        );
        const sliderValue2 = $("<div>")
          .addClass("slider-value")
          .attr("id", "slider-value2")
          .attr("value", value2)
          .text(value2);
        slider2.on("input", function () {
          sliderValue2.text(this.value);
          sliderValue2.attr("value", this.value);
        });
        sliderContainer2.append(slider2);
        sliderContainer2.append(sliderValue2);
        questionElement.append(sliderContainer2);
        break;
      case "highlight-text":
        const words = (question.moznosti || "").split(" ");
        const textContainer = $("<div>").addClass("highlight-text-container");
        words.forEach((word) => {
          const wordSpan = $("<span>")
            .addClass("highlightable")
            .text(word + " ");
          wordSpan.click(function () {
            $(this).toggleClass("highlight");
          });
          textContainer.append(wordSpan);
        });
        questionElement.append(textContainer);
        break;
      default:
        console.error("Unknown question type:", question.tip_vprasanja);
    }

    questionContainer.append(questionElement);
  }

  $("#continue-btn").click(async function () {
    const currentQuestion = questions[currentQuestionIndex];
    const message = {
      action: "responseCountUpdate",
      questionId: currentQuestion.id,
    };

    console.log("Sending WebSocket message:", message);
    socket.send(JSON.stringify(message));

    let selectedAnswer;
    let textAreaValue;

    if (questions[currentQuestionIndex].tip_vprasanja === "text-area") {
      textAreaValue = $("textarea").val();
    } else {
      if (questions[currentQuestionIndex].tip_vprasanja === "check-box") {
        selectedAnswer = [];
        $("input[name=options]:checked").each(function () {
          selectedAnswer.push($(this).val());
        });
      } else if (
        questions[currentQuestionIndex].tip_vprasanja === "check-box2"
      ) {
        selectedAnswer = [];
        $("input[name=options]:checked").each(function () {
          selectedAnswer.push($(this).val());
        });
      } else if (questions[currentQuestionIndex].tip_vprasanja === "slider") {
        selectedAnswer = $("#slider-value").attr("value");
      } else if (questions[currentQuestionIndex].tip_vprasanja === "slider2") {
        selectedAnswer = $("#slider-value2").attr("value");
      } else {
        selectedAnswer = $("input[name=options]:checked").val();
      }
    }

    if (questions[currentQuestionIndex].tip_vprasanja === "highlight-text") {
      const markedWords = [];
      $(".highlightable").each(function () {
        if ($(this).hasClass("highlight")) {
          markedWords.push($(this).text().trim());
        }
      });
      selectedAnswer = markedWords;
    }

    const nickname = sessionStorage.getItem("vzdevek");
    const gender = sessionStorage.getItem("spol");

    try {
      const data = {
        sifra_dijaka: sifraDijaka,
        Kaj_je_odgovor: selectedAnswer ? selectedAnswer : textAreaValue,
        vprasanja_id: questions[currentQuestionIndex].id,
        nickname: nickname,
        spol: gender,
        sessionId: sessionId,
      };

      const response = await fetch(
        "http://localhost:3307/api/responses/save-response",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Result:", result);
        if (currentQuestionIndex < questions.length - 1) {
          sessionStorage.setItem(
            "currentQuestionIndex",
            currentQuestionIndex + 1
          );
          window.location.href = "pocakaj.html";
        } else {
          sessionStorage.removeItem("currentQuestionIndex");
          sessionStorage.setItem("lastQuestionAnswered", true);
          window.location.href = "pocakaj.html";
        }
      } else {
        const error = await response.json();
        console.error("Napaka:", error);
        displayMessage("Napaka: " + error.message, "danger");
      }
    } catch (error) {
      console.error("Napaka:", error);
      displayMessage("Napaka je prišlo pri pošiljanju odgovora.", "danger");
    }
  });

  function displayMessage(message, type) {
    const messageBox = $("#message-box");
    messageBox.text(message).addClass(`alert alert-${type}`);
    setTimeout(() => {
      messageBox.text("").removeClass(`alert alert-${type}`);
    }, 5000);
  }
});
