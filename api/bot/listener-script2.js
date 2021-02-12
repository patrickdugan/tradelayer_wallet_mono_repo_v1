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
    TRADE_TOKEN_TOKEN: 'TRADE_TOKEN_TOKEN',
    LISTUNSPENT: 'LISTUNSPENT',
    RAWTX_FOR_SIGNING: 'RAWTX_FOR_SIGNING',
};

const EmitTypes = {
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    TRADE_REJECTION: 'TRADE_REJECTION',
    MULTYSIG_DATA: 'MULTYSIG_DATA',
    COMMIT_TX: 'COMMIT_TX',
    LISTUNSPENT: 'LISTUNSPENT',
    SIGNED_RAWTX: 'SIGNED_RAWTX',
};

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
        this.client.on(OnTypes.TRADE_TOKEN_TOKEN, this.onTradeTokenToken.bind(this));
        this.client.on(OnTypes.LISTUNSPENT, this.onListunspend.bind(this));
        this.client.on(OnTypes.RAWTX_FOR_SIGNING, this.onRawTxForSigning.bind(this));

    }

    onTradeRequest(data) {
        if (!data) return console.error('No request Data Provided!');
        if (logs) console.log(`Trade Request ${JSON.stringify(data)}`);
        const { wantedTokenId, wantedTokenAmount } = data;
        if (!wantedTokenId || !wantedTokenAmount) return console.error('Wrong request Data Provided!');
        this.wantedTokenId = wantedTokenId;
        this.wantedTokenAmount = wantedTokenAmount;
        const isValid = true;
        isValid ? this.createNewAddress() : this.rejectTrade()
    }

    onChannelPubKey(data) {
        if (!data) return console.error('No Channel Pub Key Provided!');
        if (logs) console.log(`Receive Channel Pub Key ${data}`);
        this.receiverChannelPubKey = data;
        this.addMultiSigAddress();
    }

    onTradeTokenToken(data) {
        this.commitToChannel();
    }

    onListunspend(data) {
        if (!data || data !== this.multySigChannelData.address) return console.error('Wrong MultySig Address Provided!');
        if (logs) console.log(`Getting unspent for multySig Address`);
        const lusRes = tl.listunspent(0, 9999999, [data]);
        if (lusRes.error) return console.log(lusRes.error);
        if (!lusRes.data || lusRes.data.length < 1) return console.error(`Not found unspents for the channel Address`);
        this.client.emit(EmitTypes.LISTUNSPENT, data);
        if (logs) console.log(`Unspents for multySig Address length ${data.length}`);
    }

    onRawTxForSigning(data) {
        if (!data) return console.error('No RawTx for Signing Provided!');
        if (logs) console.log(`Receive RawTx for Signing ${data}`);
        this.signRawTx(data);
    }

    rejectTrade() {
        const rejection = { reason: 'Unknown Trade Rejection Reason' };
        this.client.emit(EmitTypes.TRADE_REJECTION, rejection);
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
        this.client.emit(EmitTypes.CHANNEL_PUB_KEY, vaResult.data.pubkey);

        if (logs) console.log(`Valid Address. PubKey: ${vaResult.data.pubkey}`);
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

    async commitToChannel() {
        if (logs) console.log(`Commiting Tokens to Channel`);
        const commitData = [        
            this.listenerAddress,
            this.multySigChannelData.address,
            this.wantedTokenId,
            this.wantedTokenAmount,
        ];
        const ctcRes = await tl.commitToChannel(...commitData);
        if (ctcRes.error) return console.log(ctcRes.error);
        if (!ctcRes.data) return;
        this.listenerCommitTx = ctcRes.data;
        this.client.emit(EmitTypes.COMMIT_TX, ctcRes.data);
        if (logs) console.log(`Commit Channel Tx: ${ctcRes.data}`);
    }

    async signRawTx(rawTx) {
        if (logs) console.log(`Signing RawTx`);
        const ssrtxRes = await tl.simpleSignRawTx(rawTx);
        if (ssrtxRes.error) return console.log(ssrtxRes.error);
        if (!ssrtxRes.data) return;
        this.client.emit(EmitTypes.SIGNED_RAWTX, ssrtxRes.data);
        if (logs) console.log(`Signed RawTx ${ssrtxRes.data}`);
    }
}