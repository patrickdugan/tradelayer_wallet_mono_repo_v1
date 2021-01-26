const fs = require('fs'); // reqire fileSystem node module

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
        this.init();
    }

    init() {
        listener.on('connection', (client) => {
            this.log = {}
            this.log.start = new Date();
            this.client = client
            this.log.listenerAdress = this.address;
            console.log(`New Connection: ${client.id}`)
            
            client.on('requestTrade', (tradeOptions) => {
               const isGood = this.checkIfItsGoodDeal(tradeOptions);
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

            this.client.on('success', (data) => {
                this.saveTheLog();
                console.log(`Transaction created: ${data}`)
            })
        })
    }

    saveTheLog() {
        this.log.end = new Date();
        this.log.result = data;
        this.log.duration = Math.abs(this.log.end - this.log.start);
        console.log(this.log);
        fs.appendFile("./socket.log", JSON.stringify(this.log, null, '\t'), function(err) {
            if(err) return console.log(err.message);
            console.log("The log was saved!");
        });
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
            this.client.emit('readyForSending', hex);
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

    checkIfItsGoodDeal(tradeOptions) {
        this.log.trade = tradeOptions
        console.log(tradeOptions)
        this.propertyId = tradeOptions.tokenId_wanted;
        this.amount = tradeOptions.amount_wanted
        return true;
    }
}

const address = 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8';
new Listener();