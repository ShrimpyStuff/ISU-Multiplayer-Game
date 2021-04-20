const express = require('express')
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

let players = [1]

wss.on('connection', function connection (ws) {
  const number = players[players.length - 1]
  ws.send(`Player Number: ${number}`)
  wss.clients.forEach(function each (client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`Player Move: ${number}`)
    }
  })
  players.push((number + 1))

  ws.on('message', (message) => {
    if (!message.startsWith('Player')) {
      console.log('received: %s', message)
    }
    if (message.startsWith(`Player:`)) {
      wss.clients.forEach(function each (client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  })
  ws.on('close', () => {
    if (!wss.clients) {
      players = [1]
    }
  })
})

http.listen(process.env.PORT || 8080, () => {
  console.log('listening on *:' + http.address().port)
})
