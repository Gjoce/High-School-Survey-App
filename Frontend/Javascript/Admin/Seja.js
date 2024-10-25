const token = window.sessionStorage.getItem("jwt");
let socket;

if (token) {
  socket = new WebSocket(
    `ws://localhost:3307?token=${encodeURIComponent(token)}`
  );

  socket.onopen = function () {
    console.log("Secure WebSocket is open now.");
  };

  socket.onmessage = function (event) {
    try {
      const message = JSON.parse(event.data);
      console.log("Parsed message:", message);

      if (message.action === "responseCountUpdate") {
        const { questionId, responseCount } = message;
        if (responseCount && questionId) {
          updateResponseCount(questionId, responseCount);
          localStorage.setItem(`responseCount_${questionId}`, responseCount);
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = function () {
    console.log("WebSocket is closed now.");
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };
} else {
  console.error(
    "User not authenticated; WebSocket connection not established."
  );
}

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
      `http://localhost:3307/api/sessions/specific/${sessionId}`,
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
        vprasanjaCell.classList.add("clickable"); // Set as clickable for all

        // Adding click events for different question types
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
        dovoliButton.addEventListener("click", () => {
          console.log(
            "Dovoli button clicked for Vprasanja:",
            vprasanje.navodilo_naloge
          );

          socket.send(JSON.stringify({ action: "showNextButton" }));

          dovoliButton.classList.remove("btn-primary");
          dovoliButton.classList.add("btn-danger");
        });
        dovoliCell.appendChild(dovoliButton);
        tr.appendChild(dovoliCell);

        tbody.appendChild(tr);
      });
    });

    document.getElementById("sessionTitle").textContent = `Seja ${sessionId}`;
    document.getElementById("sessionName").textContent = ` ${data.seja.naziv}`;
  } catch (error) {
    console.error("Napaka pri prevzemu podatkov:", error);
  }
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
      `http://localhost:3307/api/responses/export/${sessionId}`,
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
