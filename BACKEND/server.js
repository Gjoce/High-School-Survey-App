const express = require("express");
require("dotenv").config();
const http = require("http");
const responseRoutes = require("./routes/responseRoutes");
const sessionRoutes = require("./routes/Admin/sessionRoutes");
const userRoutes = require("./routes/Admin/userRoutes");
const initializeWebSocket = require("./middleware/webSocketserver");
const { napolniBazo } = require("./ustvari_tabele");

const app = express();
const server = http.createServer(app);

initializeWebSocket(server);

app.use(express.static("../Frontend"));
app.use("/Slike", express.static("../Frontend/Slike"));

app.use(express.json());
app.use("/api/responses", responseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
napolniBazo();

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
