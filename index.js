const express = require('express')
const app = express()
const http = require('http').createServer(app)
const WebSocket = require('ws')

app.get('/g&p', function (req, res) {
  res.sendFile(__dirname + '/ground and platforms')
})

const wss = new WebSocket.Server({ server: http })

let players = [1]
let playersInGame = [];

wss.on('connection', function connection (ws) {
  const number = players[players.length - 1]
  if (wss.clients.size > 1) {
    ws.send(`Players-In-Game: ${JSON.stringify(playersInGame)}`);
  }
  playersInGame.push({});
  playersInGame[number-1].name = number.toString();
  playersInGame[number-1].position = "0, 0, 0";

  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`Player Joined: ${number}`)
    }
  })
  players.push((number + 1))

  ws.on('message', (message) => {
    if (message.startsWith('Move:')) {
      wss.clients.forEach(function each (client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(`Player:${number}, ${message}`)
        }
      })
    }
    if (message.match(/Position: \(.*\)$/)) {
      wss.clients.forEach(function each (client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(`Player:${number}, ${message}`)
        }
      })
      playersInGame[number-1].name = number.toString();
      playersInGame[number-1].position = message.replace(/Move: .*, Position: \((.*)\)$/, "$1");
    }
  })
  ws.on('close', () => {
    if (!wss.clients.size) {
      players = [1]
      playersInGame = []
    } else {
      playersInGame[number - 1] = {}
    }
    wss.clients.forEach(function each (client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`Player Left: ${number}`)
      }
    })
  })
})

http.listen(process.env.PORT || 8080)
