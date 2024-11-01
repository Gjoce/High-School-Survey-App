const express = require("express");
require("dotenv").config();
const http = require("http");
const responseRoutes = require("./routes/responseRoutes");
const sessionRoutes = require("./routes/Admin/sessionRoutes");
const userRoutes = require("./routes/Admin/userRoutes");
const quizRoutes = require("./routes/quizRoutes"); // Import the new quiz routes
const path = require("path");
const initializeWebSocket = require("./middleware/webSocketserver");
const db = require("./config/database");

const app = express();
const server = http.createServer(app);

initializeWebSocket(server);

app.use(express.static(path.join(__dirname, "../Frontend")));
app.use("/Slike", express.static(path.join(__dirname, "../Frontend/Slike")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.use(express.json());
app.use("/api/responses", responseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes); // Use the new quiz routes

const PORT = process.env.PORT;

db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful!");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
