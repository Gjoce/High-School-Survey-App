const WebSocket = require("ws");

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const responseCounts = {};
  const clients = [];

  wss.on("connection", function connection(ws) {
    console.log("New client connected");
    clients.push(ws);

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

        if (action === "responseCountUpdate" && questionId) {
          if (!responseCounts[questionId]) {
            responseCounts[questionId] = 0;
          }
          responseCounts[questionId]++;

          broadcastMessage({
            action: "responseCountUpdate",
            questionId: questionId,
            responseCount: responseCounts[questionId],
          });
        } else if (action === "showNextButton") {
          broadcastMessage({
            action: "showNextButton",
            questionId: questionId,
          });
        } else {
          broadcastMessage(parsedMessage);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clearInterval(keepAliveInterval);

      const index = clients.indexOf(ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });

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
