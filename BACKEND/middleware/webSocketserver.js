const WebSocket = require("ws");

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const responseCounts = {};

  wss.on("connection", function connection(ws) {
    console.log("New client connected");

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
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  action: "responseCountUpdate",
                  questionId: questionId,
                  responseCount: responseCounts[questionId],
                })
              );
            }
          });
        }

        // Show the continue quiz button for the current question when the admin clicks "Dovoli"
        if (action === "showNextButton" && questionId) {
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  action: "showNextButton",
                  questionId: questionId, // Include questionId for targeted action
                })
              );
            }
          });
        } else {
          // Handle other actions
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ action: action }));
            }
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clearInterval(keepAliveInterval);
    });
  });

  return wss;
}

module.exports = initializeWebSocket;
