const knex = require('knex')(require('./knexfile'))
const request = require('request')
const rp = require('request-promise')
const Promise = require('bluebird');
const address = '0xaaee35c0dd8e475f0346d28f0fd30a2999ff6e80'
const url = 'https://api.nanopool.org/v1/eth/user/' + address
const url2 = 'https://api.nanopool.org/v1/eth/hashratechart/' + address

var getSumOfShares = function(workers) {
  var sum = 0
  for (var i=0;i<workers.length;i++) {
    sum = sum + workers[i].rating
  }
  return sum
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    }
}

var init = function() {
  rp(url)
  .then(function(body) {
    var data = JSON.parse(body)
    var workers = data.data.workers
    var miner = {}
    var requests = []

    // reset tables
    knex('Miners').truncate().then(function(result) {})
    knex('Workers').truncate().then(function(result) {})
    knex('WorkerRates').truncate().then(function(result) {})
    console.log(" ** Miners, Workers, WorkerRates TABLES TRUNCATED ")

    // prepare & insert basic Miner info
    miner.account_name = data.data.account
    miner.balance = parseFloat(data.data.balance)
    miner.shares = getSumOfShares(workers)
    knex('Miners').insert(miner).then(function(result) {})
    console.log(" ** MINER INSERTED ")
    console.log(miner)

    // prepare & insert basic Workers info
    workers.map(function(w) {
      var o = {
        name: w.id,
        total_shares: w.rating
      }
      knex('Workers').insert(o).then (function (result) {})

      requests.push(rp({
        uri: url2 + "/" + o.name,
        method: "GET",
        resolveWithFullResponse: true
      }))

      return o
    })
    console.log(" ** WORKERS INSERTED ")

    Promise.all(requests)
    .spread(function (r1, r2, r3, r4) { // do responses have to be hard coded here?

      // fault tolerance because nanopool API sucks
      console.log(' ** workerRates response status:', JSON.parse(r1.body).status, JSON.parse(r2.body).status, JSON.parse(r3.body).status, JSON.parse(r4.body).status)
      if (!JSON.parse(r1.body).status || !JSON.parse(r2.body).status || !JSON.parse(r3.body).status || !JSON.parse(r4.body).status) {
        console.log(' -- at least one workerRates request failed, exiting...')
        process.exit()
      }
      
      // prepare worker names
      var workerNames = []
      for(var i=1; i<=requests.length; i++) {
        var responseName = "r" + i
        workerNames.push(eval(responseName).request.path.split('/').last())
      }

      console.log(workerNames)

      // select id for each worker name
      knex.select('id').from('Workers').whereIn('name',workerNames).then (function (ids) {

        // prepare wr dataset for each worker
        for (var i=0; i<workerNames.length; i++) {
          var currentResponse = eval("r" + ids[i].id)
          var rates = JSON.parse(currentResponse.body).data

          // prepare and insert wr data for current worker
          for (var j=0; j<rates.length; j++) {
            var wr = {
              workerId: ids[i].id,
              date: rates[j].date,
              shares: rates[j].shares
            }
            knex('WorkerRates').insert(wr).then (function (result) {})
          }
          console.log("      " + workerNames[i] + " WORKERRATES INSERTED ")
        }

        console.log(" ** DATA POPULATION COMPLETE! ")

      })
    })
    .catch(function (err) {
      console.log(" ** ERROR HIT, RETRYING... ")
      init()
    });
  })
  .catch(function (err) {
    console.log(" ** ERROR HIT, RETRYING... ")
    init()
  })
}

console.log(" ** STARTING DATA POPULATION... ")
init()