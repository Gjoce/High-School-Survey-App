function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: params.get("sejaId"),
    questionType: params.get("questionType"),
  };
}

async function fetchAverage() {
  const { sessionId, questionType } = getQueryParams();
  if (!sessionId || !questionType) {
    document.getElementById("averageDisplay").textContent =
      "Invalid session or question type";
    return;
  }

  try {
    const token = window.sessionStorage.getItem("jwt");
    const response = await fetch(
      `http://localhost:3307/api/responses/average-slider/${sessionId}/${questionType}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Fetching average slider data for:", sessionId, questionType);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    const average = data.average;
    document.getElementById(
      "averageDisplay"
    ).textContent = `Povprečje: ${average}`;

    const sliderInput = document.getElementById("sliderInput");
    sliderInput.value = Math.round(average);
  } catch (error) {
    document.getElementById("averageDisplay").textContent =
      "Error fetching average";
    console.error("There was a problem with the fetch operation:", error);
  }
}

window.onload = fetchAverage;
