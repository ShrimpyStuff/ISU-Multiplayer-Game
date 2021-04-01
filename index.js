const express = require('express')
const fs = require('fs')
const app = express()
const http = require('http').createServer(app)
const WebSocket = require('ws')

app.use(express.static('public'))

app.get('/', function (req, res) {
})

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + '/public/' + '404.html')
})

const wss = new WebSocket.Server({ server: http })

let players = [1];

wss.on('connection', function connection (ws) {
  ws.send(`Player Number: ${players[players.length - 1]}`)
  players.push((players[players.length - 1] + 1))

  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })
})

http.listen(process.env.PORT || 8080, () => {
  console.log('listening on *:' + http.address().port)
})
