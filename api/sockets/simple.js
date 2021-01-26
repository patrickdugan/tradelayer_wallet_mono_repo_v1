const hardCodedListenersList = ['http://localhost:9876'];
const tlAPI = require('../bot/TradeLayerRPCAPI')
const handleConnection = (client) => {
    console.log(`New Connection ${client.id}`);

    client.on('listeners-list', (options) => {
        client.emit('listeners-list', hardCodedListenersList)
    })

    client.on('checkIfMultisigReady', (channelAddress) => {
        checkMultisigReady(channelAddress)
    })
}


function checkMultisigReady(channelAddress) {

    const interval = setInterval(() => {
        tlAPI.tl.getChannelInfo(channelAddress, (data) => {
            if (
                data &&
                data['multisig address'] && 
                data['second address'] &&
                data['multisig address'].length === 34 && 
                data['second address'].length === 34
            ) {
                console.log('WORK');
                clearInterval(interval);
            } else {
                console.log('Stilll Checking ;-)', data)
            }
        })
    }, 2000)
}

module.exports = handleConnection;
