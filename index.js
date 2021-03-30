const express = require('express')
const fs = require('fs')

const privateKey = fs.readFileSync('./key.pem')
const certificate = fs.readFileSync('./cert.pem')

const options = { key: privateKey, cert: certificate }

const app = express()
const https = require('https').createServer(options, app)
const WebSocket = require('ws')

app.use(express.static('public'))

app.get('/', function (req, res) {
})

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + '/public/' + '404.html')
})

const wss = new WebSocket.Server({ server: https })

wss.on('connection', function connection (ws) {
  console.log('User Connected')
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })
})

console.log(process.env.PORT)

https.listen(process.env.PORT || 8080, () => {
  console.log('listening on *:' + https.address().port)
})
