const webSocket = new WebSocket("wss://servantchild-isu-game-2021.herokuapp.com/");
let PlayerNumber;

webSocket.onmessage = (e) => {
    let msg = e.data;
    console.log(msg);
    if (msg.startsWith("Player Number:")) {
        PlayerNumber = parseInt(msg.split(":")[1]);
    }
};

function PlayerSend(msg) {
    webSocket.send(`Player:${PlayerNumber}, ${msg}`);
}