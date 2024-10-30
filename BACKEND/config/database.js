const knex = require("knex");

const db = knex({
  client: "mysql2",
  connection: process.env.JAWS_URL,
});

db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful!");
    db.destroy();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
