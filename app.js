const request = require('request')
const rp = require('request-promise')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mysql = require('mysql')

var app = express()
var router = express.Router()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(router)

const address = '0xaaee35c0dd8e475f0346d28f0fd30a2999ff6e80'

var conn = {}

if (process.env.JAWSDB_URL) {
  conn = process.env.JAWSDB_URL
} else {
  conn = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'mining'
  }
}

var db = mysql.createConnection(conn)

var Miner={
  getMiner:function(callback){
    return db.query("SELECT * FROM Miners",callback)
  }
}

var Worker={
  getAllWorkers:function(callback){
    return db.query("SELECT * FROM Workers",callback)
  },
  getWorkerByName:function(name,callback){
    return db.query("SELECT * FROM Workers WHERE name=?",[name],callback)
  }
}

var WorkerRate={
  getAllWorkerRates:function(callback){
    return db.query("SELECT * FROM WorkerRates",callback)
  },
  getWorkerRatesById:function(workerId,callback){
    return db.query("SELECT * FROM WorkerRates WHERE workerId=?",[workerId],callback)
  }
}

router.get('/', function (req, res) {  
  res.render('index')
})

router.get('/miners', function(req, res) {
  Miner.getMiner(function(err,rows){
    if (err) {
      res.json(err)
    }
    else {
      res.json(rows)
    }
  })
})

router.get('/workers', function(req, res) {
  Worker.getAllWorkers(function(err,rows){
    if (err) {
      res.json(err)
    }
    else {
      res.json(rows)
    }
  })
})

router.get('/worker/:name?', function(req, res) {
  Worker.getWorkerByName(req.params.name, function(err,rows){
    if (err) {
      res.json(err)
    }
    else {
      res.json(rows)
    }
  })
})


router.get('/workerrates', function(req, res) {
  WorkerRate.getAllWorkerRates(function(err,rows){
    if (err) {
      res.json(err)
    }
    else {
      res.json(rows)
    }
  })
})

router.get('/workerrates/:workerId', function(req, res) {
  WorkerRate.getWorkerRatesById(req.params.workerId, function(err,rows){
    if (err) {
      res.json(err)
    }
    else {
      res.json(rows)
    }
  })
})

app.listen(7555, () => {
  console.log('Server running on http://localhost:7555')
})

