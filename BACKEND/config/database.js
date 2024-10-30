const knex = require("knex");

const db = knex({
  client: "mysql2",
  connection: {
    connectionString: process.env.JAWSDB_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: { min: 0, max: 5 },
});

module.exports = db;
