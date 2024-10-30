const knex = require("knex");

const db = knex({
  client: "mysql2",
  connection: process.env.JAWS_URL,
  pool: {
    min: 0,
    max: 10,
  },
});

module.exports = db;
