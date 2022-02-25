exports.up = function (knex) {
  return knex.schema.createTable('regears', (table) => {
    table.increments('regear_id').primary();
    table.string('event_id').notNullable();
    table.string('character_name').notNullable();
    table.string('guild_name').notNullable();
    table.string('item_power').notNullable();
    table.string('main_tier').notNullable();
    table.string('main_hand').notNullable();
    table.string('head_tier').notNullable();
    table.string('head_piece').notNullable();
    table.string('chest_tier').notNullable();
    table.string('chest_armor').notNullable();
    table.string('shoes_tier').notNullable();
    table.string('shoes').notNullable();
    table.string('time_of_death').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('regears');
};
