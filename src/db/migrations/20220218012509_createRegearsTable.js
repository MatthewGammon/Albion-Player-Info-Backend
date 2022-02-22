exports.up = function (knex) {
  return knex.schema.createTable('regears', (table) => {
    table.increments('regear_id').primary();
    table.string('event_id').notNullable();
    table.string('character_name').notNullable();
    table.string('guild_name').notNullable();
    table.string('head_piece').notNullable();
    table.string('chest_armor').notNullable();
    table.string('shoes').notNullable();
    table.string('main_hand').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('regears');
};
