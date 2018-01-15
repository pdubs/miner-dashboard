
exports.up = function (knex) {
  return knex.schema.createTable('Workers', function (t) {
    t.increments('id').primary()
    t.string('name').notNullable()
    t.integer('total_shares')
    t.timestamps(false, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Workers')
}