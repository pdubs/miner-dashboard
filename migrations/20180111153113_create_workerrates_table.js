
exports.up = function (knex) {
  return knex.schema.createTable('WorkerRates', function (t) {
    t.increments('id').primary()
    t.integer('workerId').notNullable()
    t.string('date')
    t.integer('shares')
    t.timestamps(false, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('WorkerRates')
}