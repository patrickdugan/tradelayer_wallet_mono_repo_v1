const PORT = 9876;
const listener = require('socket.io')(PORT);
const tl = require('./TradeLayerRPCAPI').tl 

const options = {
    address: 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8', // string
    propertyId: 5, // number
    amount: '0.1' // string
}

class Listener {
    constructor(options) {
        this.address = options.address;
        this.propertyId = options.propertyId;
        this.amount = options.amount;
    }

    init() {
        listener.on('connection', (io) => {
            console.log(`New Connection! ID: ${io.id}`)
            this.io = io;
            this.getNewAddress()
            this.io.on('channelPubKey', (channelPubKey) => {
                console.log('Receive second channelPubKey!')
                this.receiverChannelPubKey = channelPubKey
                this.addMultiSigAddress(this.listenerChannelPubKey, this.receiverChannelPubKey)
            })

            this.io.on('multisig', () => {
                this.listUnspent(this.channelMultisig.address)
            })

            this.io.on('signedRawTx', (signedRawTx) => {
                console.log(`Receiving signedRawTx`)
                this.signRawTx(signedRawTx)
            })

        })
    }

    getNewAddress() {
        tl.getNewAddress(null, (data) => {
            this.listenerChannelAddress = data
            console.log(`Created New Address: ${data}`)
            this.validateAddress(data)
        });
    }

    validateAddress(address) {
        tl.validateAddress(address, (d) => {
            this.listenerChannelPubKey = d.data.pubkey
            console.log(`Address Validation:`, d)
            if (d) {
                this.io.emit('channelPubKey', this.listenerChannelPubKey)
            }
        })
    }

    addMultiSigAddress(channelPubkeyListen, channelPubKeyReceive) {
        tl.addMultisigAddress(2, [channelPubkeyListen, channelPubKeyReceive], (data) => {
            this.channelMultisig = data
            console.log(`Created MultisigAddress`, data)
            if (data) {
                this.commitToChannel(data)
            }
        })
    }
    commitToChannel(multiSig) {
        console.log(`Commit toChannel!`)
        tl.commitToChannel(this.address, multiSig.address, this.propertyId, this.amount, (result) => {
            const { data, error } = result;
            if (error) return console.log(error.message);
            console.log(`Commited to The multisig Address, result: ${data}`)
            const multySigData = {
                 'multisig': multiSig,
                 'pubKeyUsed': this.listenerChannelPubKey
            }
            if (data) {
                this.io.emit('multisig', multySigData)
            }
        })
    }

    listUnspent(channelAddress) {
        tl.listunspent(0, 9999999, [channelAddress], (listunspent) => {
            console.log(`Sending listunspent to the Receiver for building rawTx: ${listunspent.length} `)
            if (listunspent) {
                this.io.emit('buildRawTx', {
                    listunspent,
                    listenerParams: {
                        propertyId: this.propertyId,
                        amount: this.amount,
                    }
                })
            }
        })
    }

    signRawTx(rawTx) {
        console.log(`Start co Signing rawTx`)
        tl.simpleSign(rawTx, (res) => {
            if(res.error) return console.log(res.error);
            const signedTx = res.data;
            if (!signedTx.complete) return console.error("Fail with signing the rawTX")
            const { hex } = signedTx
            if (!hex) return console.erreor("Fail with signing the rawTX")
            console.log(`coSigned RawTX: ${ hex }`)
            this.sendRawTx(hex)
        })
    }

    sendRawTx(hex) {
        tl.sendRawTransaction(hex, (res) => {
            const { data, error } = res;
            if (error) return console.log(error);
            console.log(data)
            if(!data) return console.erreor("Fail with sending the rawTX")
            console.log(`Successfull!`)
            console.log(`Transaction created: ${data}`)
            if (data) {
                this.io.emit('success', data)
            }
        })
    }
}

const myListener = new Listener(options);
myListener.init();