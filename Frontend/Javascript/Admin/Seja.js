const token = window.sessionStorage.getItem("jwt");

function updateResponseCount(questionId, responseCount) {
  const numOfResponsesCell = document.getElementById(
    `responseCount_${questionId}`
  );
  if (numOfResponsesCell) {
    numOfResponsesCell.textContent = responseCount.toString();
  } else {
    console.warn(`Element with ID responseCount_${questionId} not found.`);
  }
}

function getCurrentDateNumeric() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displaySessionDetails() {
  const currentDateElement = document.getElementById("currentDate");
  const currentDate = getCurrentDateNumeric();

  if (currentDateElement) {
    currentDateElement.textContent = currentDate;
  }
}

async function fetchDataAndPopulateTable(sessionId) {
  const token = window.sessionStorage.getItem("jwt");
  try {
    const response = await fetch(
      `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/sessions/specific/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Network response failed");

    const data = await response.json();
    const tbody = document.getElementById("dataTableBody");
    tbody.innerHTML = "";

    data.sklopi.forEach((sklop) => {
      sklop.vprasanja.forEach((vprasanje) => {
        const tr = document.createElement("tr");

        const stVprasanjaCell = document.createElement("td");
        stVprasanjaCell.textContent = vprasanje.stevilo_naloge;
        tr.appendChild(stVprasanjaCell);

        const vprasanjaCell = document.createElement("td");
        vprasanjaCell.textContent = vprasanje.navodilo_naloge;
        vprasanjaCell.classList.add("clickable");

        // Event listeners for different question types
        if (vprasanje.tip_vprasanja === "text-area") {
          vprasanjaCell.addEventListener("click", () => {
            window.open(`TextAreaAnswers.html?sejaId=${sessionId}`, "_blank");
          });
        } else if (vprasanje.zgradiGraf) {
          vprasanjaCell.addEventListener("click", () => {
            window.open(`graph.html?id=${vprasanje.id}`, "_blank");
          });
        } else if (vprasanje.tip_vprasanja === "slider") {
          vprasanjaCell.addEventListener("click", () => {
            window.open(
              `sliderGraph.html?sejaId=${sessionId}&questionType=slider`,
              "_blank"
            );
          });
        } else if (vprasanje.tip_vprasanja === "slider2") {
          vprasanjaCell.addEventListener("click", () => {
            window.open(
              `sliderGraph.html?sejaId=${sessionId}&questionType=slider2`,
              "_blank"
            );
          });
        }

        tr.appendChild(vprasanjaCell);

        const numOfResponsesCell = document.createElement("td");
        const storedResponseCount =
          localStorage.getItem(`responseCount_${vprasanje.id}`) || "0";
        numOfResponsesCell.textContent = storedResponseCount;
        numOfResponsesCell.setAttribute("id", `responseCount_${vprasanje.id}`);
        tr.appendChild(numOfResponsesCell);

        const dovoliCell = document.createElement("td");
        const dovoliButton = document.createElement("button");
        dovoliButton.textContent = "Dovoli";
        dovoliButton.classList.add("btn", "btn-primary");
        dovoliButton.addEventListener("click", async () => {
          console.log(
            "Dovoli button clicked for Vprasanja:",
            vprasanje.navodilo_naloge
          );

          // Notify the server to allow continuation
          await fetch(
            "https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/responses/allow-continuation",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                questionId: vprasanje.id,
                allowed: true,
              }),
            }
          );

          dovoliButton.classList.remove("btn-primary");
          dovoliButton.classList.add("btn-danger");
        });
        dovoliCell.appendChild(dovoliButton);
        tr.appendChild(dovoliCell);

        tbody.appendChild(tr);

        // Start polling for this question's allowed state
        startPollingForContinuation(vprasanje.id);
      });
    });

    document.getElementById("sessionTitle").textContent = `Seja ${sessionId}`;
    document.getElementById("sessionName").textContent = ` ${data.seja.naziv}`;
  } catch (error) {
    console.error("Napaka pri prevzemu podatkov:", error);
  }
}

async function checkIfAllowed(questionId) {
  const token = window.sessionStorage.getItem("jwt");
  try {
    const response = await fetch(
      `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/responses/allowed/${questionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Network response failed");

    const data = await response.json();
    if (data.allowed) {
      // Display the continue quiz button or whatever action you want
      const continueButton = document.getElementById("continue-quiz");
      continueButton.style.display = "block"; // Show continue button
      console.log(`Question ${questionId} is allowed to continue.`);
    }
  } catch (error) {
    console.error("Error checking allowed state:", error);
  }
}

function startPollingForContinuation(questionId) {
  setInterval(() => {
    checkIfAllowed(questionId);
  }, 5000); // Poll every 5 seconds
}

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("id");

if (sessionId) {
  fetchDataAndPopulateTable(sessionId);
} else {
  console.error("Session ID not found in URL");
}

displaySessionDetails();

async function downloadExcel() {
  const sessionId = urlParams.get("id");
  const token = window.sessionStorage.getItem("jwt");
  try {
    const response = await fetch(
      `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/responses/export/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download Excel file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "odgovor_data.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading Excel file:", error);
  }
}

document.getElementById("excelButton").addEventListener("click", downloadExcel);

$(document).ready(function () {
  $("#qrButton").click(function () {
    const sessionId = urlParams.get("id");
    window.open(`QrURL.html?id=${sessionId}`, "_blank");
  });
});

document.getElementById("sessionTitle").textContent += sessionId;

document.getElementById("leaderboardButton").addEventListener("click", () => {
  const leaderboardUrl = `leaderboard.html?sejaId=${sessionId}`;
  window.open(leaderboardUrl, "_blank");
});
