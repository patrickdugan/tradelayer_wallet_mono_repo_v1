const hardCodedListenersList = ['http://localhost:9876']
const handleConnection = (client) => {
    console.log(`New Connection ${client.id}`);

    client.on('listeners-list', (options) => {
        client.emit('listeners-list', hardCodedListenersList)
    })
}

module.exports = handleConnection;