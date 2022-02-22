const knex = require('../db/connection');

function read(event_Id) {
  return knex('regears').select('*').where({ event_id: event_Id }).first();
}

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
  read,
  list,
};
