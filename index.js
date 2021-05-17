const express = require('express')
const app = express()
const http = require('http').createServer(app)
const WebSocket = require('ws')


app.get('/assets/ground and platforms', function (req, res) {
  res.sendFile(__dirname + "ground and platforms");
})

const wss = new WebSocket.Server({ server: http })

let players = [1]

wss.on('connection', function connection (ws) {
  const number = players[players.length - 1]
  ws.send(`Player Number: ${number}`)
  wss.clients.forEach(function each (client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`Player Joined: ${number}`)
    }
  })
  players.push((number + 1))

  ws.on('message', (message) => {
    if (!message.startsWith('Player') || !message == "heartbeat") {
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
    if (!wss.clients.size) {
      players = [1]
    }
  })
})

http.listen(process.env.PORT || 8080, () => {
  console.log('listening on *:' + http.address().port)
})
