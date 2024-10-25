// server.js
const express = require("express");
require("dotenv").config();
const http = require("http");
const responseRoutes = require("./routes/responseRoutes");
const sessionRoutes = require("./routes/Admin/sessionRoutes");
const userRoutes = require("./routes/Admin/userRoutes");
const initializeWebSocket = require("./middleware/webSocketserver");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server
initializeWebSocket(server);

app.use(express.static("../Spletna_stran"));
app.use("/Slike", express.static("../Spletna_stran/Slike"));

app.use(express.json());
app.use("/api/responses", responseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3307;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
