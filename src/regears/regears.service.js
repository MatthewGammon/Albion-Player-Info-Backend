const knex = require('../db/connection');

function create(regear) {
  return knex('regears')
    .insert(regear)
    .returning('*')
    .then((createdRegear) => createdRegear[0]);
}

function list() {
  return knex('regears').select('*').orderBy('created_at');
}

module.exports = {
  create,
  list,
};
