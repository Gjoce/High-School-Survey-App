const WebSocket = require("ws");

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const responseCounts = {};
  const clients = []; // Store all active connections

  wss.on("connection", function connection(ws) {
    console.log("New client connected");
    clients.push(ws); // Add new client to the clients array

    const keepAliveInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "ping" }));
      }
    }, 30000);

    ws.on("message", function incoming(message) {
      try {
        const parsedMessage = JSON.parse(message);
        const action = parsedMessage.action;
        const questionId = parsedMessage.questionId;

        // Handling the response count update
        if (action === "responseCountUpdate" && questionId) {
          if (!responseCounts[questionId]) {
            responseCounts[questionId] = 0;
          }
          responseCounts[questionId]++;

          // Notify all clients about the updated response count
          broadcastMessage({
            action: "responseCountUpdate",
            questionId: questionId,
            responseCount: responseCounts[questionId],
          });

          // Show the continue quiz button for the current question
          broadcastMessage({
            action: "showNextButton",
            questionId: questionId, // Include questionId if needed
          });
        } else {
          // Handle other actions
          broadcastMessage(parsedMessage);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clearInterval(keepAliveInterval);
      // Remove the disconnected client from the clients array
      const index = clients.indexOf(ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });

  // Function to broadcast a message to all connected clients
  function broadcastMessage(message) {
    clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return wss;
}

module.exports = initializeWebSocket;
