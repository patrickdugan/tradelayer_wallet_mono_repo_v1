const client = require('socket.io-client');
const tl = require('./TradeLayerRPCAPI').tl

const URL = 'http://localhost' //replace this with the ip address of the listener, assumes a static ip
const PORT = 9876

const options = {
    address: 'QbbqvDj2bJkeZAu4yWBuQejDd86bWHtbXh', // string
    propertyId: 4, // number
    amount: '0.1' // string
}

class Receiver {
    constructor(options) {
        this.address = options.address;
        this.propertyId = options.propertyId;
        this.amount = options.amount;
        this.io = client.connect(`${URL}:${PORT}`);

    }
    init() {
        this.io.on('connect', () => {
            console.log('Connected !')
        })

        this.io.on('channelPubKey', (channelPubKey) => {
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
            console.log(`Start Building rawTx from unspents: ${unspentArray.length}`)
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

    getNewAddress() {
        tl.getNewAddress(null, (data) => {
            this.receiverChannelAddress = data
            console.log(`Created New Address: ${data}`)
            this.validateAddress(data)
        });
    }

    validateAddress(address) {
        tl.validateAddress(address, (d) => {
            this.receiverChannelPubKey = d.data.pubkey
            console.log(`Address Validation:`, d)
            if (d) {
                this.io.emit('channelPubKey', this.receiverChannelPubKey)
            }
        })
    }

    commitToChannel(multiSigAddress) {
        console.log(`Commit toChannel!`)
        tl.commitToChannel(this.address, multiSigAddress, this.propertyId, this.amount, (data) => {
            console.log(`Commited to The multisig Address, result: ${data}`)
            if (data) {
                this.io.emit('multisig')
            }
         })
    }

    legitMultisig(multySigData, cb) {
        console.log('work')
        tl.addMultisigAddress(2, [multySigData.pubKeyUsed, this.receiverChannelPubKey], (data) => {
            const legit = data.reedemScript == multySigData.multisig.reedemScript ? true : false
                return cb(legit)
        })
    }

    buildTokenToTokenTrade(inputs, id1, amount1, id2, amount2, secondSigner = true, cb) {
        tl.getBlock(null, (block) => {
            if (!block) return console.error('Can not get block')
            const height = block.height + 3
            console.log(`block Height: ${height}`)
            tl.createpayload_instant_trade(id1, amount1, id2, amount2, height, (payload) => {
                if (!payload) return console.error('Cant create Payload!')
                //set refAddress to null to skip adding reffaddress
                const buildOptions = {
                    txid: inputs[0].txid,
                    vout: inputs[0].vout,
                    payload,
                }
                tl.buildRawAsync(buildOptions, (rawTx) => {
                    if (!rawTx) return console.error('Cant build RawTx')
                    cb(rawTx)
                })
            })
        })
    }

    signRawTx(rawTx) {
        console.log(`Start Signing rawTx`)
        tl.simpleSign(rawTx, (res) => {
            if (res.error) return console.log(res.error);
            const signedTx = res.data
            if (!signedTx.complete) return console.error("Fail with signing the rawTX")
            const { hex } = signedTx
            console.log(`Signed RawTX: ${ hex }`)
            if (hex) {
                this.io.emit('signedRawTx', hex)
            }
        })
    }
}

const myReceiver = new Receiver(options);
myReceiver.init();