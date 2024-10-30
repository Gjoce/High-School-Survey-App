const knex = require("knex");

const db = knex({
  client: "mysql2",
  connection: {
    connectionString: process.env.JAWSDB_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: { min: 0, max: 5 },
});

db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful!");
    db.destroy();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
