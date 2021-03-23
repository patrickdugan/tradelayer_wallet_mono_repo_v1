const poolListeners = [];
const PORT = 9876;
function initPool(PORT) {
    const options = { cors: { origin: "*", methods: ["GET", "POST"]}};
    const io = require('socket.io')(PORT, options);
    io.on('connection', (socket) => {
        const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];
        if (poolListeners.find(l => l.address === ip)) {
            return;
        }
        socket.emit('test', { test: 'Empty Test' });
        socket.on('testResult', (result) => {
            if (result.isValid === true) {
                console.log(`New Listener: ${ip}`)
                poolListeners.push({ address: ip, socketID: socket.id });
                console.log(poolListeners)

            }
        })

        socket.on('disconnect', () => {
            const listener = poolListeners.find(l => l.socketID === socket.id);
            console.log(`Listenr: ${listener.address} disconnected !`)
            poolListeners.filter(l => l !== listener);
        })
    })

};

module.exports = { initPool };