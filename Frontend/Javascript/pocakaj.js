let socket;

function initializeWebSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket("wss://spolna-enakost-a5b1f42434e5.herokuapp.com");

    socket.onopen = function () {
      console.log("WebSocket is open now.");
    };

    socket.onmessage = function (event) {
      const messageData = event.data;
      console.log("Message received:", messageData);

      try {
        const message = JSON.parse(messageData);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing message as JSON:", error);
      }
    };

    socket.onclose = function () {
      console.log("WebSocket is closed now. Attempting to reconnect...");
      setTimeout(initializeWebSocket, 1000);
    };

    socket.onerror = function (event) {
      console.error("WebSocket error observed:", event);
    };
  }
}

function handleWebSocketMessage(message) {
  if (message.action === "showNextButton") {
    $("#continue-quiz").show();
    const continueButton = document.getElementById("continue-btn");
    continueButton.disabled = false;
    console.log("Admin has allowed users to proceed.");
  }
}

initializeWebSocket();

$(document).ready(function () {
  $("#continue-quiz").hide();

  const userId = sessionStorage.getItem("sifraKviza");
  if (userId) {
    fetchUserPoints(userId);
  } else {
    console.error("User ID not found in sessionStorage.");
  }

  $("#continue-quiz").click(function () {
    const lastQuestionAnswered = sessionStorage.getItem("lastQuestionAnswered");
    if (lastQuestionAnswered) {
      sessionStorage.removeItem("lastQuestionAnswered");
      showCongratulations();
    } else {
      window.location.href = "Vprasanja.html";
    }
  });
});

function fetchUserPoints(userId) {
  fetch(
    `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/responses/points/${userId}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById(
        "points"
      ).textContent = `Uspelo ti je zbrati: ${data.points} točke`;
    })
    .catch((error) => console.error("Error fetching points:", error));
}

function showCongratulations() {
  $("#continue-quiz").hide();
  $("#cestitam").hide();
  $("#congratulations-message").show();
  setTimeout(function () {
    window.location.href = "sklop.html";
  }, 5000);
}
