function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  return params;
}

async function fetchAnswers() {
  const params = getQueryParams();
  const sejaId = params["sejaId"];
  const container = document.getElementById("answersContainer");
  container.innerHTML = "";

  if (!sejaId) {
    container.innerHTML = "<p>Session ID is missing in the URL.</p>";
    return;
  }

  try {
    const token = window.sessionStorage.getItem("jwt");
    const response = await fetch(
      `http://localhost:3307/api/sessions/answers/${sejaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.length === 0) {
      container.innerHTML =
        "<p>No text-area questions found for the given session ID.</p>";
      return;
    }

    data.forEach((item) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";

      const questionTitle = document.createElement("h3");
      questionTitle.textContent = `Vprašanje: ${item.question}`;
      questionDiv.appendChild(questionTitle);

      const answersContainer = document.createElement("div");
      answersContainer.className = "answersContainer";

      item.answers.forEach((answer) => {
        const answerDiv = document.createElement("div");
        answerDiv.className = "answer";
        answerDiv.innerHTML = `<p>${answer.answer}</p>`;
        answersContainer.appendChild(answerDiv);
      });

      questionDiv.appendChild(answersContainer);
      container.appendChild(questionDiv);
    });
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", fetchAnswers);
