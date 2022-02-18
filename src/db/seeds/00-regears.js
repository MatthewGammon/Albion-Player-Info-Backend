const regears = require('./00-regears.json');
exports.seed = function (knex) {
  return knex
    .raw('TRUNCATE TABLE regears RESTART IDENTITY CASCADE')
    .then(() => knex('regears').insert(regears));
};
