const poolListeners = [];
const PORT = 9876;
function initPool(PORT) {
    const options = { cors: { origin: "*", methods: ["GET", "POST"]}};
    const io = require('socket.io')(PORT, options);

    io.on('connection', (socket) => {
        const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];

        if (poolListeners.find(l => l.address === ip)) {
            socket.disconnect()
            return;
        }
        socket.emit('test', { test: 'Empty Test' });
        socket.on('testResult', (result) => {
            if (result.port) {
                console.log(`New Listener: ${ip}, PORT: ${result.port}`)
                poolListeners.push({ address: ip, port: result.port, socketID: socket.id });
            }
        })

        socket.on('disconnect', (s) => {
            const listener = poolListeners.find(l => l.socketID === socket.id);
            if(!listener) return;
            const index = poolListeners.indexOf(listener);
            if (index > -1) {
                console.log(`Listenr: ${listener.address}:${listener.port} disconnected !`)
                poolListeners.splice(index, 1);
              }

        })

        setTimeout(() => console.log(poolListeners),1000)
    })

};

const getListener = () => {
    return poolListeners[Math.floor(Math.random() * poolListeners.length)];
}
module.exports = { initPool, getListener };