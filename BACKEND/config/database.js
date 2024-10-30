const knex = require("knex");

const jawsUrl = process.env.JAWS_URL;

const db = knex({
  client: "mysql2",
  connection: jawsUrl,
});

module.exports = db;
