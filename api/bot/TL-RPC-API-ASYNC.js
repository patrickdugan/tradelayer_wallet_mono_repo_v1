const config = require('../config');
const litecoin = require('../ltc_client.js')

const user = config.RPC_USER;
const pass = config.RPC_PASS;
const host = config.RPC_HOST;
const port = config.RPC_PORT;

const api = {};
api.complex = {};

// api.init = (user, pass, host = 'localhost', port) => {
//     const connectionConfig = { host, port, user, pass, timeout:30000, ssl:false }
//     return new litecoin.Client(connectionConfig)
// };

// const client = api.init(user, pass, host, port);

const asyncClient = async (...args) => 
(await new Promise((resolve, reject) => {
    try {
        litecoin.cmd(...args, (error, data) => {
            const result = { error: null, data: null }
            if (error) result.error = error.message
            if (data) result.data = data
            resolve(result);
        })
    } catch (error) {
        reject(error)
    }
}));

// Litecoin RPC APIs

api.getInfo = async () => 
    await asyncClient("tl_getinfo");

api.getNewAdress = async (account = null) =>
    await asyncClient("getnewaddress", account);

api.validateAddress = async (address) =>
    await asyncClient("validateaddress", address);

api.simpleSignRawTx = async (tx) =>
    await asyncClient("signrawtransaction", tx);

api.sendRawTx = async (tx) =>
    await asyncClient('sendrawtransaction', tx);

api.getBestBlockHash = async () =>
    await asyncClient('getbestblockhash');

api.getBlockHash = async (block) =>
    await asyncClient('getblockhash', block);

api.getBlock = async (hash) =>
    await asyncClient('getblock', hash);

api.listunspent = async (min = 0, max = 9999999, channelsArray = null) =>
    await asyncClient("listunspent", min, max, channelsArray);

api.addMultisigAddress = async (n, pubkeysArray) =>
    await asyncClient("addmultisigaddress", n, pubkeysArray);


// TradeLayer RPC APIs

api.getTransaction = async (tx) => 
    await asyncClient("tl_gettransaction", tx);

api.createPayload_instantTrade = async (id1, amount1, expiryBlockHeight, id2, amount2) =>
    await asyncClient('tl_createpayload_instant_trade', id1, amount1, expiryBlockHeight, id2, amount2);

api.commitToChannel = async (sendingAddress, channelAddress, propertyid, amount) =>
    await asyncClient("tl_commit_tochannel",sendingAddress, channelAddress, propertyid, amount);


// Complex RPC APIs

api.getBestBlock = async () => {
    const bestBlockHashResult = await api.getBestBlockHash();
    const bestBlockHashError = bestBlockHashResult.error;
    const bestBlockHashData = bestBlockHashResult.data;

    return bestBlockHashError 
        ? bestBlockHashResult 
        : await api.getBlock(bestBlockHashData);
};

api.buildRawTx = async () => {};
module.exports = api;