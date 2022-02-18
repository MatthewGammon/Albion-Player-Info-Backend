require('dotenv').config();
const path = require('path');
const {
  DATABASE_URL = 'postgresql://postgres@localhost/postgres',
  DATABASE_URL_DEVELOPMENT = 'postgresql://postgres@localhost/postgres',
  DATABASE_URL_TEST = 'postgresql://postgres@localhost/postgres',
  DATABASE_URL_PREVIEW = 'postgresql://postgres@localhost/postgres',
  DEBUG,
} = process.env;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_DEVELOPMENT,
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds'),
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
