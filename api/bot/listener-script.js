const tl = require('./TradeLayerRPCAPI').tl 
const PORT = 9876
var listener = require('socket.io')(PORT, {
	cors: {
	  origin: "*",
	  methods: ["GET", "POST"]
	}
  });

class Listener {
    constructor() {
        this.address = 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8'
        this.propertyId = 5;
        this.amount = '0.02'
        this.init();
    }

    init() {
        listener.on('connection', (client) => {
            this.client = client
            console.log(`New Connection: ${client.id}`)
            
            client.on('requestTrade', (tradeOptions) => {
               const isGood = checkIfItsGoodDeal(tradeOptions);
               isGood ?  this.createNewAddress() : this.rejectTheTrade();
            })

            client.on('channelPubKey', (channelPubKey) => {
                console.log('Receive second channelPubKey!')
                this.receiverChannelPubKey = channelPubKey
                this.addMultiSigAddress(this.listenerChannelPubKey, this.receiverChannelPubKey)
            })

            this.client.on('multisig', () => {
                this.listUnspent(this.channelMultisig.address)
            })

            this.client.on('signedRawTx', (signedRawTx) => {
                console.log(`Receiving signedRawTx`)
                this.signRawTx(signedRawTx)
            })
        })
    }

    sendRawTx(hex) {
        tl.sendRawTransaction(hex, (res) => {
            const { data, error } = res;
            if (error) return console.log(error.message);
            if(!data) return console.erreor("Fail with sending the rawTX")
            if (data) {
                this.client.emit('success', data)
                console.log(`Transaction created: ${data}`)
            }
        })
    }

    signRawTx(rawTx) {
        console.log(`Start co Signing rawTx`)
        tl.simpleSign(rawTx, (res) => {
            const { data, error} = res;
            if(error) return console.log(error.message);
            if (!data.complete) return console.error("Fail with signing the rawTX")
            const { hex } = data
            if (!hex) return console.erreor("Fail with signing the rawTX")
            console.log(`coSigned RawTX: ${ hex }`)
            this.sendRawTx(hex)
        })
    }

    listUnspent(channelAddress) {
        tl.listunspent(0, 9999999, [channelAddress], (listunspent) => {
            console.log(`Sending listunspent to the Receiver for building rawTx: ${listunspent.length} `)
            if (listunspent) {
                this.client.emit('buildRawTx', {
                    listunspent,
                    listenerParams: {
                        propertyId: this.propertyId,
                        amount: this.amount,
                    }
                })
            }
        })
    }

    addMultiSigAddress(channelPubkeyListen, channelPubKeyReceive) {
        console.log(`Created MultisigAddress`)
        tl.addMultisigAddress(2, [channelPubkeyListen, channelPubKeyReceive], (data) => {
            this.channelMultisig = data
            console.log(`Created MultisigAddress`, data)
            if (data) {
                this.commitToChannel(data)
            }
        })
    }

    commitToChannel(multiSig) {
        console.log(`Commiting to Channel!`)
        tl.commitToChannel(this.address, multiSig.address, this.propertyId, this.amount, (result) => {
            const { data, error } = result;
            if (error) return console.log(error.message);
            console.log(`Commited to The multisig Address, result: ${data}`)
            const multySigData = {
                 'multisig': multiSig,
                 'pubKeyUsed': this.listenerChannelPubKey
            }
            if (data) {
                this.client.emit('multisig', multySigData)
            }
        })
    }

    createNewAddress() {
        console.log(`Creating new Address!`);
        tl.getNewAddress(null, (data) => {
            this.listenerChannelAddress = data
            console.log(`Created New Address: ${data}`)
            this.validateAddress(data)
        });
    }

    validateAddress(address) {
        console.log(`Validating the Address! ${address}`);
        tl.validateAddress(address, (d) => {
            this.listenerChannelPubKey = d.data.pubkey
            console.log(`Address Validation:`, d)
            if (d) {
                this.client.emit('channelPubKey', this.listenerChannelPubKey)
            }
        })
    }

    rejectTheTrade() {
        console.log(`Rejecting the trade!`)
        this.client.emit('tradeRejection', "Rejecting the Trade!")
    }
}

const address = 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8';
new Listener();

function checkIfItsGoodDeal() {
    //check logic
    return true;
}