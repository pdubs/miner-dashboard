
exports.up = function (knex) {
  return knex.schema.createTable('Miners', function (t) {
    t.increments('id').primary()
    t.string('account_name').notNullable()
    t.float('balance', 10, 8)
    t.integer('shares')
    t.timestamps(false, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Miners')
}