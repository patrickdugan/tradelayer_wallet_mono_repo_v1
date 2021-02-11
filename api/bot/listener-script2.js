// const fs = require('fs'); // reqire fileSystem node module
const tl = require('./TL-RPC-API-ASYNC');

const logs = true;
const PORT = 9876;
const listenerAddress = 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8'
const socketOptions = { cors: { origin: "*", methods: ["GET", "POST"] } };
const listener = require('socket.io')(PORT, socketOptions);

const OnTypes = {
    TRADE_REQUEST: 'TRADE_REQUEST',
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
};

const EmitTypes = {
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    TRADE_REJECTION: 'TRADE_REJECTION',
    MULTYSIG_DATA: 'MULTYSIG_DATA',
}

listener.on('connection', (client) => {
    if (logs) console.log(`New Connection: ${client.id}`)
    new Listener(client, listenerAddress);
});

class Listener {
    constructor(client, listenerAddress) {
        this.client = client
        this.listenerAddress = listenerAddress;
        this.handleListeners();
    }

    handleListeners() {
        this.client.on(OnTypes.TRADE_REQUEST, this.onTradeRequest.bind(this));
        this.client.on(OnTypes.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));

    }

    onTradeRequest(data) {
        if (logs) console.log(`Trade Request ${JSON.stringify(data)}`);

        const isValid = true;

        isValid ? this.createNewAddress() : this.rejectTrade()
    }

    onChannelPubKey(data) {
        if (!data) return console.error('No Channel Pub Key Provided!');
        if (logs) console.log(`Reveive Channel Pub Key ${data}`);
        this.receiverChannelPubKey = data;
        this.addMultiSigAddress();
    }

    async createNewAddress() {
        if (logs) console.log(`Creating New Address`);

        const gnaRes = await tl.getNewAdress();
        if (gnaRes.error) return console.log(gnaRes.error);
        if (!gnaRes.data) return;

        if (logs) console.log(`Created New Address ${gnaRes.data}`);
    
        const vaResult = await tl.validateAddress(gnaRes.data);
        if (vaResult.error) return console.log(vaResult.error);
        if (!vaResult.data || !vaResult.data.isvalid) return 
        this.listenerChannelPubKey = vaResult.data.pubkey;
        this.client.emit(EmitTypes.CHANNEL_PUB_KEY, this.listenerChannelPubKey);

        if (logs) console.log(`Valid Address. PubKey: ${vaResult.data.pubkey}`);
    }

    rejectTrade() {
        const rejection = { reason: 'Unknown Trade Rejection Reason' };
        this.client.emit(EmitTypes.TRADE_REJECTION, rejection);
    }

    async addMultiSigAddress() {
        if (logs) console.log(`Creating MultySig Address`);
        const pubKeys = [ this.listenerChannelPubKey, this.receiverChannelPubKey ];
        const amaRes = await tl.addMultisigAddress(2, pubKeys);
        if (amaRes.error) return console.log(amaRes.error);
        if (!amaRes.data) return;
        this.multySigChannelData = amaRes.data;
        this.client.emit(EmitTypes.MULTYSIG_DATA, amaRes.data)
        if (logs) console.log(`Created MultySig Address ${JSON.stringify(amaRes.data)}`);
    }
}