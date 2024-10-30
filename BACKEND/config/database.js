const knex = require("knex");

const connection = process.env.JAWSDB_URL
  ? {
      connectionString: process.env.JAWSDB_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      client: "mysql2",
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
    };

const db = knex({
  client: "mysql2",
  connection,
});

module.exports = db;
