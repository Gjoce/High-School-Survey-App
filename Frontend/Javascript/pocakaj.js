$(document).ready(function () {
  $("#continue-quiz").hide();

  const socket = new WebSocket(
    "wss://spolna-enakost-a5b1f42434e5.herokuapp.com"
  );

  socket.onmessage = function (event) {
    const messageData = event.data;
    console.log("Message received:", messageData);

    try {
      const message = JSON.parse(messageData);
      console.log("Parsed message:", message);

      if (message.action === "showNextButton") {
        $("#continue-quiz").show();
      }
    } catch (error) {
      console.error("Error parsing message as JSON:", error);
    }
  };

  socket.onopen = function (event) {
    console.log("WebSocket is open now.");
  };

  socket.onclose = function (event) {
    console.log("WebSocket is closed now.");
  };

  socket.onerror = function (event) {
    console.error("WebSocket error observed:", event);
  };

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

function showCongratulations() {
  $("#continue-quiz").hide();
  $("#cestitam").hide();
  $("#congratulations-message").show();
  setTimeout(function () {
    window.location.href = "sklop.html";
  }, 5000);
}
