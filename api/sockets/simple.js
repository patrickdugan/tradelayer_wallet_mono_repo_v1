const hardCodedListenersList = ['http://localhost:9876'];
const asyncTL = require('../bot/TL-RPC-API-ASYNC');
const handleConnection = (client) => {
    console.log(`New Connection ${client.id}`);

    client.on('listeners-list', (options) => {
        client.emit('listeners-list', hardCodedListenersList)
    })

    client.on('CHECK_COMMITS', async (data) => {
        const { commitTxs, signedRawTx } = data;
        ;
        const result = {
                commitsTxs: await Promise.all(commitTxs.map(async (tx) => ({tx, isValid: await isTxValid(tx)}))),
                rawTx: signedRawTx,
            };
        client.emit('CHECK_COMMITS_RES', result);
    });

    client.on('CHECK_TL_TX', async (data) => {
        const { tlTx, rawTx } = data;
        const result = {
            rawTx,
            tlTx,
            isTlTxValid: await isTxValid(tlTx),
        };
        client.emit('CHECK_TL_TX_RES', result);
    })
}

function isTxValid(txid) {
    console.log(`Chcking if txIsValid ${txid}`)
    return new Promise((res,rej) => {
        const interval = setInterval(async () => {
            const gtRes = await asyncTL.getTransaction(txid);
            if (gtRes.error || !gtRes.data) return;
            if (gtRes.data.confirmations > 0) {
                res(gtRes.data.valid);
                clearInterval(interval);
            }
        }, 20000)
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
