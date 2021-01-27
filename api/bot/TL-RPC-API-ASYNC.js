const config = require('../config');
const litecoin = require('../ltc_client.js')

const user = config.RPC_USER;
const pass = config.RPC_PASS;
const host = config.RPC_HOST;
const port = config.RPC_PORT;

const api = {};

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

api.getInfo = async () => await asyncClient("tl_getinfo");

module.exports = api;