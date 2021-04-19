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

api.fundRawTx = async (tx) =>
    await asyncClient('fundrawtransaction', tx);

// TradeLayer RPC APIs

api.getTransaction = async (tx) => 
    await asyncClient("tl_gettransaction", tx);

api.createPayload_instantTrade = async (id1, amount1, id2, amount2, expiryBlockHeight) =>
    await asyncClient('tl_createpayload_instant_trade', id1, amount1, id2, amount2, expiryBlockHeight);

api.createPayload_instantTrade_LTC = async (id, amount, ltc, expiryBlockHeight) =>
    await asyncClient('tl_createpayload_instant_ltc_trade', id, amount, ltc, expiryBlockHeight);

api.commitToChannel = async (sendingAddress, channelAddress, propertyid, amount) =>
    await asyncClient("tl_commit_tochannel",sendingAddress, channelAddress, propertyid, amount);

api.getallbalancesforaddress = async (address) =>
    await asyncClient('tl_getallbalancesforaddress', address);

api.getLtcvolume = async (tokenId) =>
    await asyncClient('tl_get_ltcvolume', tokenId, 1, 999999999)
// Complex RPC APIs

api.getBestBlock = async () => {
    const bestBlockHashResult = await api.getBestBlockHash();
    const bestBlockHashError = bestBlockHashResult.error;
    const bestBlockHashData = bestBlockHashResult.data;

    return bestBlockHashError 
        ? bestBlockHashResult 
        : await api.getBlock(bestBlockHashData);
};

api.buildRawTx = async (txid, vout, payload, refAddress = null, changeAddress = null) => {
    if (!txid || vout === undefined || !payload) return { error: 'Missing txid, vout or payload' };
    const piRes = await asyncClient('decodescript', payload);
    if (piRes.error || !piRes.data) return { error: `${payload} Payload is not valid!` };
    const txoiRes = await asyncClient('gettxout', txid, vout);
    if (txoiRes.error || !txoiRes.data) return { error: 'Error with tx id or vout' };
    const value = txoiRes.data.value;
    const scriptPubKey = txoiRes.data.scriptPubKey.hex;
    const _changeAddress = changeAddress ? changeAddress : txoiRes.data.scriptPubKey.addresses[0];
    const changeData = [{ txid, vout, scriptPubKey, value, }];

    const crtxiRes = await asyncClient('tl_createrawtx_input', '', txid, vout);
    if (crtxiRes.error || !crtxiRes.data) return { error: 'Error with creating raw tx' };

    const crtxoRes = await asyncClient('tl_createrawtx_opreturn', crtxiRes.data, payload);
    if (crtxoRes.error || !crtxoRes.data) return { error: 'Error with adding payload' };

    const crtxrRes = !refAddress ? crtxoRes : await asyncClient('tl_createrawtx_reference', crtxoRes.data, refAddress);
    if (crtxrRes.error || !crtxrRes.data) return { error: 'Error with adding referance address' };

    const crtxcRes = await asyncClient('tl_createrawtx_change', crtxrRes.data, changeData, _changeAddress, '0.00036000');
    if (crtxcRes.error || !crtxcRes.data) return { error: 'Error with adding change address' };

    return crtxcRes;
};

module.exports = api;