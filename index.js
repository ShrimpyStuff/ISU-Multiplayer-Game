const express = require('express')
const app = express()
const http = require('http').createServer(app)
const WebSocket = require('ws')
const bodyParser = require('body-parser')
const mysql = require('mysql')
require('dotenv').config()

app.get('/g&p', function (req, res) {
  res.sendFile(__dirname + '/ground and platforms')
})

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB
})

let recentlyUsedTokens = []

function newToken() {
  let temp = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  if (!recentlyUsedTokens.includes(temp)) {return temp} else {temp = newToken()}
}

app.post('/login', function (req, res) {
  let username = req.body.username
  let password = req.body.password
  pool.query(`SELECT \`password\` FROM \`logins\` WHERE \`username\` = (SELECT \`username\` FROM logins WHERE \`username\` = '${username}')`, (err, result, fields) => {
    if (err) {
      res.redirect('/login')
      throw err
    }
    if (password === result[0].password) {
      let randomToken = newToken()
      let object = {token: randomToken, username}
      recentlyUsedTokens.push(object)
      res.send(randomToken)
    } else {
      return res.redirect('/login')
    }
  })
})

const wss = new WebSocket.Server({ server: http })

let players = [1]
let playersInGame = [];

wss.on('connection', function connection (ws) {
  let username = '';
  ws.on('message', (message) => {
    if (message.startsWith('Token:')) {
      for (i=0; i<recentlyUsedTokens.length; i++){
        if (message.split(':')[1] === recentlyUsedTokens[i].token) {
          username = recentlyUsedTokens[i].username
          break
        } else {
          ws.close()
        }
      }
    }
  })
  const number = players[players.length - 1]
  if (wssMain.clients.size > 1) {
    ws.send(`Players-In-Game: ${JSON.stringify(playersInGame)}`);
  }
  playersInGame.push({});
  playersInGame[number-1].name = number.toString();
  playersInGame[number-1].position = "0, 0, 0";
  
  wss.clients.forEach(function each(client) {
    client.send(`Player:${number}, Portal:${pool.query(`SELECT \`PortalNumber\` FROM \`logins\` WHERE \`username\` = '${username}')`)}`)
  })

  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`Player Joined: ${number}`)
    }
  })
  players.push((number + 1))

  ws.on('message', (message) => {
    if (message.startsWith('Portal:')) {
      wss.clients.forEach(function each (client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(`Player:${number}, ${message}`)
        }
      })
      pool.query(`UPDATE \`logins\` SET \`PortalNumber\` = \`${message.split(':')[1]}\` WHERE username=\`${username}\``, )
    }
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
    if (!wssMain.clients.size) {
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

http.listen((process.env.PORT || 8080), () => {
  console.log('Started')
})
