import io from 'socket.io-client';
import { rpcApis } from '../services/rpc-api.service';

const logs = true;


const EmitTypes = {
    TRADE_REQUEST: 'TRADE_REQUEST',
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    TRADE_TOKEN_TOKEN: 'TRADE_TOKEN_TOKEN',
    LISTUNSPENT: 'LISTUNSPENT',
    RAWTX_FOR_SIGNING: 'RAWTX_FOR_SIGNING',
};

const OnTypes = {
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    TRADE_REJECTION: 'TRADE_REJECTION',
    MULTYSIG_DATA: 'MULTYSIG_DATA',
    COMMIT_TX: 'COMMIT_TX',
    LISTUNSPENT: 'LISTUNSPENT',
    SIGNED_RAWTX: 'SIGNED_RAWTX',
};


export default class Receiver {
    constructor(listenerURL) {
        this.listenerUrl = listenerURL;
        this.initConnection();
    }

    initConnection() {
        this.client = io.connect(this.listenerUrl);
        this.client.on('connect', this.connected.bind(this));
    }

    connected() {
        if (logs) console.log(`Connected to: ${this.listenerUrl}`);
        this.handleMainListeners();
        this.requestTrade();
    }

    handleMainListeners() {
        this.client.on(OnTypes.TRADE_REJECTION, this.onTradeRejection.bind(this));
        this.client.on(OnTypes.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));
        this.client.on(OnTypes.MULTYSIG_DATA, this.onMultySigData.bind(this));

        this.handleSubListeners();
    }

    onTradeRejection(data) {
        if (logs) console.log(`Trade Rejection ${JSON.stringify(data)}`);
    }

    onChannelPubKey(data) {
        if (!data) return console.error('No Channel Pub Key Provided!');
        if (logs) console.log(`Received Channel Pub Key ${data}`);
        this.listenerChannelPubKey = data;
        this.createNewAddress();
    }

    onMultySigData(data) {
        if (!data) return console.error('No MultySig Data Provided!');
        if (logs) console.log(`Received MultySig data: ${JSON.stringify(data)}`);
        const pubKeys = [this.listenerChannelPubKey, this.receiverChannelPubKey]
        const isValid = this.legitMultySig(pubKeys, data.redeemScript);
        if (logs) console.log(`Received MultySig Address is${ isValid ? '' : "NOT" } valid`);
        if (!isValid) return console.error('Wrong MyltySig Data Provided !');
        this.multySigChannelData = data;
        this.initTrade();
    }

    async createNewAddress() {
        if (logs) console.log(`Creating New Address`);

        const gnaRes = await rpcApis.asyncTL('getNewAdress');
        if (gnaRes.error) return console.log(gnaRes.error);
        if (!gnaRes.data) return;
        if (logs) console.log(`Created New Address ${gnaRes.data}`);
    
        const vaResult = await rpcApis.asyncTL('validateAddress', gnaRes.data);
        if (vaResult.error) return console.log(vaResult.error);
        if (!vaResult.data || !vaResult.data.isvalid) return 
        this.receiverChannelPubKey = vaResult.data.pubkey;
        this.client.emit(EmitTypes.CHANNEL_PUB_KEY, this.receiverChannelPubKey)

        if (logs) console.log(`Valid Address. PubKey: ${vaResult.data.pubkey}`);
    }

    async legitMultySig(pubKeys, redeemScript) {
        if (logs) console.log(`Legiting Multysig`);

        const amaRes = await rpcApis.asyncTL('addMultisigAddress', 2, pubKeys);
        if (amaRes.error) return console.log(amaRes.error);
        if (!amaRes.data) return;
        const legitRedeemScript = amaRes.data.redeemScript;
        return redeemScript === legitRedeemScript;
    }
}

class TokenForTokenTradeReceiver extends Receiver {
    constructor(listenerURL) {
        super(listenerURL);
        this.receiverAddress = 'QbbqvDj2bJkeZAu4yWBuQejDd86bWHtbXh'
        this.tradeOptions = { 
            offerTokenId: 4,
            offerTokenAmount: '0.003', 
            wantedTokenId: 5,
            wantedTokenAmount: '0.0156' ,
        };
    }

    handleSubListeners() {
        this.client.on(OnTypes.COMMIT_TX, this.onCommitTx.bind(this));
        this.client.on(OnTypes.LISTUNSPENT, this.onListunspent.bind(this));
        this.client.on(OnTypes.SIGNED_RAWTX, this.onSignedRawTx.bind(this));
    }

    onCommitTx(data) {
        if (!data) return console.error('No Commit Tx Provided!');
        if (logs) console.log(`Receive Commit Tx ${data}`);
        this.commitToChannel();
    }

    onListunspent(data) {
        if (!data || data.length < 1) return console.error('No Unspents Provided!');
        if (logs) console.log(`Channel Address unspents length ${data.length}`);
        this.buildTokenForTokenTrade(data);
    }

    onSignedRawTx(data) {
        if (!data) return console.error('No Signed RawTx Provided!');
        if (logs) console.log(`Received Signed RawTx: ${data}`);
        this.signRawTx(data);
    }

    requestTrade() {
        if (logs) console.log(`Init Trade`);
        const { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount } = this.tradeOptions;
        const tradeOptions = { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount };
        this.client.emit(EmitTypes.TRADE_REQUEST, tradeOptions);
        if (logs) console.log(`Sended Trade Request ${JSON.stringify(tradeOptions)}`);
    }

    initTrade() {
        console.log(`Init Token/Token Trade !`);
        this.client.emit(EmitTypes.TRADE_TOKEN_TOKEN);
    }

    async commitToChannel() {
        if (logs) console.log(`Commiting Tokens to Channel`);
        const commitData = [        
            this.receiverAddress,
            this.multySigChannelData.address,
            this.tradeOptions.offerTokenId,
            this.tradeOptions.offerTokenAmount,
        ];
        const ctcRes = await rpcApis.asyncTL('commitToChannel', ...commitData);
        if (ctcRes.error) return console.log(ctcRes.error);
        if (!ctcRes.data) return;
        this.receiverCommitTx = ctcRes.data;
        this.client.emit(EmitTypes.LISTUSNPENT, this.multySigChannelData.address);
        if (logs) console.log(`Commit Channel Tx: ${ctcRes.data}`);
    }

    async buildTokenForTokenTrade(unspentsArray) {
        if (logs) console.log(`Building Token/Token Trade`);
        const bbRes = rpcApis.asyncTL('getBestBlock');
        if (bbRes.error) return console.log(bbRes.error);
        if (!bbRes.data || bbRes.data.height) return;
        const nAddBlocks = 5
        const height = blockData.height + nAddBlocks;
        if (logs) console.log(`Best Block: ${bbRes.data.height} - exp.Block : ${height}`);

        const cpitOptions = [
            this.tradeOptions.offerTokenId,
            this.tradeOptions.offerTokenAmount,
            height,
            this.tradeOptions.wantedTokenId,
            this.tradeOptions.wantedTokenAmount,
        ];
        const cpitRes = await rpcApis.asyncTL('createPayload_instantTrade', ...cpitOptions);
        if (cpitRes.error) return console.log(cpitRes.error);
        if (!cpitRes.data) return;
        if (logs) console.log(`Created Instat Trade payload: ${cpitRes.data}`);

        const brtxOptions = [unspentsArray[0].txid, unspentsArray[0].vout, cpitRes.data];
        const brtxRes = await rpcApis.asyncTL('buildRawTx', ...brtxOptions)
        if (brtxRes.error) return console.log(brtxRes.error);
        if (!brtxRes.data) return;
        this.client.emit(EmitTypes.RAWTX_FOR_SIGNING, vrtx.data);
        if (logs) console.log(`Builded rawTx hex: ${brtx.data}`);
    }

    async signRawTx(rawTx) {
        if (logs) console.log(`Signing The Raw Transaction`);
        const ssrtxRes = await rpcApis.asyncTL('simpleSignRawTx', rawTx);
        if (ssrtxRes.error) return console.log(ssrtxRes.error);
        if (!ssrtxRes.data) return;
        this.sendRawTx(ssrtxRes.data);
        if (logs) console.log(`Signed RawTx ${ssrtxRes.data}`);
    }

    async sendRawTx(rawTx) {
        if (logs) console.log(`Sending The Raw Transaction`);
        const srtxRes = await rpcApis.asyncTL('sendRawTx', rawTx);
        if (srtxRes.error) return console.log(srtxRes.error);
        if (!srtxRes.data) return;
        if (logs) console.log(`Final Transaction: ${srtxRes.data}`);
    }
}