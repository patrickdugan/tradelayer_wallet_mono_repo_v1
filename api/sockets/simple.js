const hardCodedListenersList = ['http://localhost:9876'];
const tlAPI = require('../bot/TradeLayerRPCAPI')
const handleConnection = (client) => {
    console.log(`New Connection ${client.id}`);

    client.on('listeners-list', (options) => {
        client.emit('listeners-list', hardCodedListenersList)
    })

    client.on('checkIfCommitsValid', async (data) => {
        const { commitTxsForCheck , rawTx } = data;
        console.log(':)');
        if (!commitTxsForCheck) return console.log('error')
        console.log(commitTxsForCheck)
        const { listenerCommitTx, receiverCommitTx } = commitTxsForCheck
        if (!listenerCommitTx || !receiverCommitTx) return console.log('error')

        const listenerCommitIsValid = isTxValid(listenerCommitTx);
        const receiverCommitIsValid = isTxValid(receiverCommitTx);
        Promise.all([listenerCommitIsValid, receiverCommitIsValid])
            .then(result => {
                const obj = {
                    listenerCommitIsValid: result[0],
                    receiverCommitIsValid: result[1],
                    rawTx,
                };
                client.emit('validCommits', obj)
            })
    });

    client.on('checkValidTlTx', (data) => {
        const { tlTx, rawTx } = data;
        isTxValid(tlTx)
            .then((result) => {
                client.emit('validLastTx', { result, rawTx });
            })
    })
}

function isTxValid(txid) {
    console.log(`Chcking if txIsValid ${txid}`)
    return new Promise((res,rej) => {
        const interval = setInterval(() => {
            console.log('still checking')
            tlAPI.tl.getTransaction(txid, (data) => {
                console.log(data.confirmations)
                if (data && data.confirmations > 0) {
                    clearInterval(interval)
                    res(data.valid)
                }
            })
        }, 5000)
    })
}
// function checkMultisigReady(channelAddress) {

//     const interval = setInterval(() => {
//         tlAPI.tl.getChannelInfo(channelAddress, (data) => {
//             if (
//                 data &&
//                 data['multisig address'] && 
//                 data['second address'] &&
//                 data['multisig address'].length === 34 && 
//                 data['second address'].length === 34
//             ) {
//                 console.log('WORK');
//                 clearInterval(interval);
//             } else {
//                 console.log('Stilll Checking ;-)', data)
//             }
//         })
//     }, 2000)
// }

module.exports = handleConnection;
