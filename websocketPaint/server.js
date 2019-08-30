const express = require('express');
const enableWs = require('express-ws');
const Store = require('./store.js');

const app = express();
const expressWs = enableWs(app);
app.use(express.static('public'));
const store = new Store();

const sendAll = msg => {
    store.users.forEach((user, i) =>  {
        user.send(JSON.stringify(msg))
    })
};

const handleConnect = (ws) => {
    store.addUser(ws);

    sendAll({
        cmd: 'info',
        payload: store.users.length
    });

    sendAll({
        cmd: 'sendPath',
        payload: store.paintData
    });

    console.log(store.users.length);
};

const handleMessage = jsonMessage => {
    const message = JSON.parse(jsonMessage);
    const {cmd, payload} = message;

    switch (cmd) {
        case 'startLine':
            store.startLine(payload);
            sendAll({
                cmd: 'startLine',
                payload: store.paintData
            });
            break;
        case 'sendPath':
            store.addPath(payload);
            sendAll({
                cmd: 'sendPath',
                payload: store.paintData
            });
            break;
        case 'clear':
            store.clearStore();
            break;
        default:
            return;
    }
};

const handleClose = (ws) => {
    const index = store.users.indexOf(ws);

    if (index > -1) {
        store.users.splice(index, 1);
    }

    console.log(`user id ${index} disconnected`);
};

app.ws('/ws', ws => {
    handleConnect(ws);

    ws.on('message', msg => {
        handleMessage(msg, ws);
    });

    ws.on('close', () => {
        handleClose(ws);
    });
});

app.listen(3000);