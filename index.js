const express = require('express')
const app = express()
const http = require('http').createServer(app)
const WebSocket = require('ws');

app.use(express.static('public'))

app.get('/', function (req, res) {
})

app.use(function (req, res, next) {
  res.status(404).sendFile( __dirname + "/public/" + "404.html" );
})

const wss = new WebSocket.Server({ server: http });

wss.on('connection', function connection(ws) {
console.log("User Connected")
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

http.listen(8080, () => {
  console.log('listening on *:' + http.address().port)
})