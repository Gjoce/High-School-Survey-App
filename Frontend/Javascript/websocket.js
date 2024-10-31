// websocket.js
let socket;

function initializeWebSocket() {
  // Check if the WebSocket is already initialized
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
      setTimeout(initializeWebSocket, 1000); // Attempt to reconnect after 1 second
    };

    socket.onerror = function (event) {
      console.error("WebSocket error observed:", event);
    };
  }
}

function handleWebSocketMessage(message) {
  // Logic to handle incoming messages from the server
  if (message.action === "showNextButton") {
    document.getElementById("continue-quiz").style.display = "block";
  }

  // Enable the continue button if the action is "dovoli"
  if (message.action === "dovoli") {
    // Enable the continue button
    const continueButton = document.getElementById("continue-btn");
    continueButton.disabled = false; // Assuming this button is initially disabled
    console.log("Admin has allowed the user to proceed.");
  }
}

// Initialize WebSocket connection
initializeWebSocket();
