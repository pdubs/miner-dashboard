require('dotenv').config()
module.exports = {
  client: 'mysql',
  connection: process.env.JAWSDB_URL,
  useNullAsDefault: true
}