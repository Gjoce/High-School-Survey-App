const WebSocket = require("ws");

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const responseCounts = {};

  wss.on("connection", function connection(ws) {
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
        } else {
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ action: action }));
            }
          });
        }
      } catch (error) {
        console.error("Napaka pri parsanju WebSocketa:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}

module.exports = initializeWebSocket;
