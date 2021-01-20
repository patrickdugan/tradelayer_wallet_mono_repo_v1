import client from 'socket.io-client';
import { rpcApis } from '../services/rpc-api.service';
class Receiver {
    constructor(listenerURL, options) {
        this.address = 'QbbqvDj2bJkeZAu4yWBuQejDd86bWHtbXh';
        this.propertyId = 4;
        this.amount = '0.01';
        this.io = client.connect(listenerURL);
        this.init();
        console.log(listenerURL)
    }

    init() {
        this.io.on('connect', () => {
            this.sendTradeRequest()
        })

        this.io.on('tradeRejection', (message) => {
            console.log(message);
        })

        this.io.on('channelPubKey', () => {
            this.getNewAddress()
        })

        this.io.on('multisig', (multySigData) => {
            console.log(`Receiving multisig Data`, multySigData)
            this.legitMultisig(multySigData, (legit) => {
                console.log(`Legit the Multisig: ${legit}`)
                if (legit == true) {
                    this.channelMultisig = multySigData.multisig.address
                    this.commitToChannel(this.channelMultisig)
                } else { 
                    return console.log('The client tried to scam with a bad multisig')
                }
            })
        })

        this.io.on('buildRawTx', (buildRawTxData) => {
            const { listenerParams } = buildRawTxData
            const unspentArray = buildRawTxData.listunspent
            console.log(`Start Building rawTx from unspents: ${unspentArray.length}`);

            this.buildTokenToTokenTrade(unspentArray, this.propertyId, this.amount, listenerParams.propertyId, listenerParams.amount, true, (res) => {
                if(res.error) return console.log(res.error);
                const rawTx = res.data
                console.log(`Builded rawTx: ${rawTx}`)
                if (!rawTx) return console.error('Can not Build RawTX')
                this.signRawTx(rawTx)
            })
        })

        this.io.on('success', (data) => {
            console.log(`Successfull!`)
            console.log(`Transaction created: ${data}`)
        })
    }

    async signRawTx(rawTx) {
        console.log(`Start Signing rawTx`)
        const signResult = await rpcApis.rpcCall('simpleSign', rawTx);
        const { data, error } = signResult;
        console.log(data)
        if (error) return console.log(error.message);
        if (!data) return;
        if (!data.data.complete) return console.error("Fail with signing the rawTX")
        const { hex } = data.data
        if (hex) {
            console.log(`Signed RawTX: ${ hex }`)
            this.io.emit('signedRawTx', hex)
        }
    }

    async buildTokenToTokenTrade(inputs, id1, amount1, id2, amount2, secondSigner = true, cb) {
        const blockResult = await rpcApis.rpcCall('getBlock', null);
        const blockData = blockResult.data;
        const blockError = blockResult.error;
        if (blockError) return console.log(blockError.message);
        if (!blockData) return;
        const height = blockData.height + 3
        console.log(`block Height: ${height}`)

        const payloadResult = await rpcApis.rpcCall('createpayload_instant_trade', id1, amount1, id2, amount2, height);
        const payloadData = payloadResult.data
        const payloadError = payloadResult.error

        if (payloadError) return console.log(payloadError.message);
        if (!payloadData) return;
        const buildOptions = {
            txid: inputs[0].txid,
            vout: inputs[0].vout,
            payload: payloadData,
        }

        const buildRawResult = await rpcApis.rpcCall('buildRawAsync', buildOptions);
        const buildRawData = buildRawResult.data
        const buildRawError = buildRawResult.error

        if (buildRawError) return console.log(buildRawError.message);
        if (!buildRawData) return console.error('Cant build RawTx')
        cb(buildRawData)
    }

    async commitToChannel(multiSigAddress) {
        console.log(`Commiting to Channel!`)
        const result = await rpcApis.rpcCall('commitToChannel', this.address, multiSigAddress, this.propertyId, this.amount);
        const { data, error } = result;
        if (error) return console.log(error.message);
        if (data) {
            console.log(`Commited to The multisig Address, result: ${data}`)
            this.io.emit('multisig');
        }
    }

    async legitMultisig(multySigData, cb) {
        console.log('addMultisigAddress', 2, [multySigData.pubKeyUsed, this.receiverChannelPubKey])
        const result = await rpcApis.rpcCall('addMultisigAddress', 2, [multySigData.pubKeyUsed, this.receiverChannelPubKey]);
        console.log(result)
        const { data, error } = result;
        if (error) return console.log(error.message);
        const legit = data.reedemScript == multySigData.multisig.reedemScript ? true : false
        cb(legit)
    }

    async getNewAddress() {
        const result = await rpcApis.rpcCall('getNewAddress', null);
        const { data, error } = result;
        if (error) return console.log(error.message);
        if (data) {
            console.log(`Created New Address: ${data}`)
            this.receiverChannelAddress = data;
            this.validateAddress(data)
        }
    }

    async validateAddress(address) {
        const result = await rpcApis.rpcCall('validateAddress', address);
        const { data, error } = result;
        if (error) return console.log(error.message);
        if (data) {
            this.receiverChannelPubKey = data.data.pubkey
            console.log(`Address Validation:`, data)
            this.io.emit('channelPubKey', this.receiverChannelPubKey)
        }
    }

    sendTradeRequest() {
        const tradeOptions = {
            tokenId: 4,
            tokenId_wanted: 5,
            amount: 0.01,
            amount_wanted: 0.02,
        };
        this.io.emit('requestTrade', tradeOptions);
    }
}

export default Receiver