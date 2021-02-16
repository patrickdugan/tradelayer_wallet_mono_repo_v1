import io from 'socket.io-client';
import { rpcApis } from '../services/rpc-api.service';

const logs = true;


const EmitTypes = {
    TRADE_REQUEST: 'TRADE_REQUEST',
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    COMMIT_TO_CHANNEL: ' COMMIT_TO_CHANNE',
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

const TradeTypes = {
    TOKEN_FOR_TOKEN: 'TOKEN_FOR_TOKEN',
    LTC_INSTANT: 'LTC_INSTANT'
};

export default class Receiver {
    constructor(listenerURL) {
        this.listenerUrl = listenerURL;
        this.initConnection();

        this.resultPromise = new Promise((res, rej) => {
            this._resultPromise = { res, rej };
        });
    }

    initConnection() {
        this.client = io.connect(this.listenerUrl, { 'reconnection': false });
        this.client.on('connect', this.connected.bind(this));
    }

    connected() {
        if (logs) console.log(`Connected to: ${this.listenerUrl}`);
        this.handleMainListeners();
        this.requestTrade();
    }

    emitError(errorMessage) {
        this.client.disconnect();
        this._resultPromise.rej(errorMessage);
        console.error(errorMessage);
    }

    handleMainListeners() {
        try {
            this.client.on(OnTypes.TRADE_REJECTION, this.onTradeRejection.bind(this));
            this.client.on(OnTypes.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));
            this.client.on(OnTypes.MULTYSIG_DATA, this.onMultySigData.bind(this));
            this.handleSubListeners();
        } catch (error) {
            this.emitError(error.message || 'Error with socket on listeners');
        }
    }

    onTradeRejection(data) {
        if (logs) console.log(`Trade Rejection ${JSON.stringify(data)}`);
        this.client.disconnect();
    }

    onChannelPubKey(data) {
        if (!data) return this.emitError('No Channel Pub Key Provided!');
        if (logs) console.log(`Received Channel Pub Key ${data}`);
        this.listenerChannelPubKey = data;
        this.createNewAddress();
    }

    onMultySigData(data) {
        if (!data) return this.emitError('No MultySig Data Provided!');
        if (logs) console.log(`Received MultySig data: ${JSON.stringify(data)}`);
        const pubKeys = [this.listenerChannelPubKey, this.receiverChannelPubKey]
        const isValid = this.legitMultySig(pubKeys, data.redeemScript);
        if (logs) console.log(`Received MultySig Address is${ isValid ? '' : "NOT" } valid`);
        if (!isValid) return this.emitError('Wrong MyltySig Data Provided !');
        this.multySigChannelData = data;
        this.initTrade();
    }

    async createNewAddress() {
        if (logs) console.log(`Creating New Address`);

        const gnaRes = await rpcApis.asyncTL('getNewAdress');
        if (gnaRes.error || !gnaRes.data) return this.emitError(gnaRes.error || 'Error with creating new address !');
        if (logs) console.log(`Created New Address ${gnaRes.data}`);
    
        const vaResult = await rpcApis.asyncTL('validateAddress', gnaRes.data);
        if (vaResult.error || !vaResult.data || !vaResult.data.isvalid) return this.emitError(vaResult.error || `Error with Address Validation`);
        this.receiverChannelPubKey = vaResult.data.pubkey;
        this.client.emit(EmitTypes.CHANNEL_PUB_KEY, this.receiverChannelPubKey)

        if (logs) console.log(`Valid Address. PubKey: ${vaResult.data.pubkey}`);
    }

    async legitMultySig(pubKeys, redeemScript) {
        if (logs) console.log(`Legiting Multysig`);

        const amaRes = await rpcApis.asyncTL('addMultisigAddress', 2, pubKeys);
        if (amaRes.error || !amaRes.data) return this.emitError(amaRes.error || `Error with legit creating Multysig`);
        const legitRedeemScript = amaRes.data.redeemScript;
        return redeemScript === legitRedeemScript;
    }
}

export class TokenForTokenTradeReceiver extends Receiver {
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
        if (!data) return this.emitError('No Commit Tx Provided!');
        if (logs) console.log(`Receive Commit Tx ${data}`);
        this.listenerCommitTx = data;
        this.commitToChannel();
    }

    onListunspent(data) {
        if (!data || data.length < 1) return this.emitError('No Unspents Provided!');
        if (logs) console.log(`Channel Address unspents length ${data.length}`);
        this.buildTokenForTokenTrade(data);
    }

    onSignedRawTx(data) {
        if (!data) return this.emitError('No Signed RawTx Provided!');
        if (logs) console.log(`Received Signed RawTx: ${data}`);
        this.signRawTx(data);
    }

    requestTrade() {
        if (logs) console.log(`request Trade`);
        const { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount } = this.tradeOptions;
        const tradeOptions = { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount };
        this.client.emit(EmitTypes.TRADE_REQUEST, tradeOptions);
        if (logs) console.log(`Sended Trade Request ${JSON.stringify(tradeOptions)}`);
    }

    initTrade() {
        if (logs) console.log(`Init Token/Token Trade !`);
        this.client.emit(EmitTypes.COMMIT_TO_CHANNEL);
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
        if (ctcRes.error || !ctcRes.data) return this.emitError(ctcRes.error || `Error with Commiting to channel`);
        this.receiverCommitTx = ctcRes.data;
        this.client.emit(EmitTypes.LISTUNSPENT, this.multySigChannelData.address);
        if (logs) console.log(`Commit Channel Tx: ${ctcRes.data}`);
    }

    async buildTokenForTokenTrade(unspentsArray) {
        if (logs) console.log(`Building Token/Token Trade`);
        const bbRes = await rpcApis.asyncTL('getBestBlock');
        if (bbRes.error || !bbRes.data || !bbRes.data.height) return this.emitError(bbRes.error || `Error with getting best block`);
        const nAddBlocks = 5
        const height = bbRes.data.height + nAddBlocks;
        if (logs) console.log(`Best Block: ${bbRes.data.height} - exp.Block : ${height}`);

        const cpitOptions = [
            this.tradeOptions.offerTokenId,
            this.tradeOptions.offerTokenAmount,
            this.tradeOptions.wantedTokenId,
            this.tradeOptions.wantedTokenAmount,
            height,
        ];
        const cpitRes = await rpcApis.asyncTL('createPayload_instantTrade', ...cpitOptions);
        if (cpitRes.error || !cpitRes.data) return this.emitError(cpitRes.error || `Error with creating payload`);
        if (logs) console.log(`Created Instat Trade payload: ${cpitRes.data}`);

        const brtxOptions = [unspentsArray[0].txid, unspentsArray[0].vout, cpitRes.data];
        const brtxRes = await rpcApis.asyncTL('buildRawTx', ...brtxOptions)
        if (brtxRes.error || !brtxRes.data) return this.emitError(brtxRes.error || `Error with Building raw TX`);
        this.client.emit(EmitTypes.RAWTX_FOR_SIGNING, brtxRes.data);
        if (logs) console.log(`Builded rawTx hex: ${brtxRes.data}`);
    }

    async signRawTx(rawTx) {
        if (logs) console.log(`Signing The Raw Transaction`);
        const ssrtxRes = await rpcApis.asyncTL('simpleSignRawTx', rawTx);
        if (ssrtxRes.error || !ssrtxRes.data || !ssrtxRes.data.complete || !ssrtxRes.data.hex) return this.emitError(ssrtxRes.error || `Error with signing the tx`);
        if (logs) console.log(`Signed RawTx ${ssrtxRes.data.hex}`);
        const _data = {
            commitTxs: [this.listenerCommitTx, this.receiverCommitTx],
            signedRawTx: ssrtxRes.data.hex,
        };
        this._resultPromise.res(_data);
        this.client.disconnect();
    }
}

export class LTCInstantTradeReceiver extends Receiver {
    constructor(listenerURL) {
        super(listenerURL);
        this.receiverAddress = 'QbbqvDj2bJkeZAu4yWBuQejDd86bWHtbXh'
        this.tradeOptions = {
            tradeType: TradeTypes.LTC_INSTANT,
            wantedTokenId: 5,
            wantedTokenAmount: '0.0156',
            totalPrice: '0.0001',
        };
    }

    handleSubListeners() {
        this.client.on(OnTypes.COMMIT_TX, this.onCommitTx.bind(this));
        this.client.on(OnTypes.LISTUNSPENT, this.onListunspent.bind(this));
        this.client.on(OnTypes.SIGNED_RAWTX, this.onSignedRawTx.bind(this));
    }

    onCommitTx(data) {
        if (!data) return this.emitError('No Commit Tx Provided!');
        if (logs) console.log(`Receive Commit Tx ${data}`);
        this.listenerCommitTx = data;
        this.client.emit(EmitTypes.LISTUNSPENT, this.multySigChannelData.address);
    }

    onListunspent(data) {
        if (!data || data.length < 1) return this.emitError('No Unspents Provided!');
        if (logs) console.log(`Channel Address unspents length ${data.length}`);
        this.buildLTCInstantTrade(data);
    }

    onSignedRawTx(data) {
        if (!data) return this.emitError('No Signed RawTx Provided!');
        if (logs) console.log(`Received Signed RawTx: ${data}`);
        this.signRawTx(data);
    }

    requestTrade() {
        if (logs) console.log(`request Trade`);
        const { tradeType, wantedTokenId, wantedTokenAmount } = this.tradeOptions;
        const tradeOptions = { tradeType, wantedTokenId, wantedTokenAmount };
        this.client.emit(EmitTypes.TRADE_REQUEST, tradeOptions);
        if (logs) console.log(`Sended Trade Request ${JSON.stringify(tradeOptions)}`);
    }

    initTrade() {
        if (logs) console.log(`Init LTC Instant Trade !`);
        this.client.emit(EmitTypes.COMMIT_TO_CHANNEL);
    }

    async buildLTCInstantTrade(unspentsArray) {
        if (logs) console.log(`Building LTC Instant Trade`);
        const bbRes = await rpcApis.asyncTL('getBestBlock');
        if (bbRes.error || !bbRes.data || !bbRes.data.height) return this.emitError(bbRes.error || `Error with getting best block`);
        const nAddBlocks = 5
        const height = bbRes.data.height + nAddBlocks;
        if (logs) console.log(`Best Block: ${bbRes.data.height} - exp.Block : ${height}`);
        const cpitOptions = [
            this.tradeOptions.wantedTokenId,
            this.tradeOptions.wantedTokenAmount,
            this.tradeOptions.totalPrice,
            height,
        ];
        const cpiltcRes = await rpcApis.asyncTL('createPayload_instantTrade_LTC', ...cpitOptions);
        if (cpiltcRes.error || !cpiltcRes.data) return this.emitError(cpiltcRes.error || `Error with creating payload`);
        if (logs) console.log(`Created Instat Trade payload: ${cpiltcRes.data}`);

        const brtxOptions = [unspentsArray[0].txid, unspentsArray[0].vout, cpiltcRes.data, 'QNQGyQs75G2wrdkVhQAVztoU9Ma6EQe1a8'];
        const brtxRes = await rpcApis.asyncTL('buildRawTx', ...brtxOptions)
        if (brtxRes.error || !brtxRes.data) return this.emitError(brtxRes.error || `Error with Building raw TX`);
        if (logs) console.log(`Builded rawTx hex: ${brtxRes.data}`);
        this.fundRawTx(brtxRes.data);
    }

    async fundRawTx(rawTx) {
        if (logs) console.log(`Funding Raw TX`);
        const frtxRes = await rpcApis.asyncTL('fundRawTx', rawTx);
        if (frtxRes.error || !frtxRes.data || !frtxRes.data.hex) return this.emitError(frtxRes.error || `Error with Fundint Raw Transaction`);
        this.client.emit(EmitTypes.RAWTX_FOR_SIGNING, frtxRes.data.hex);
        if (logs) console.log(`Raw Tx funded: ${JSON.stringify(frtxRes.data.hex)}`);
    }

    async signRawTx(rawTx) {
        if (logs) console.log(`Signing The Raw Transaction`);
        const ssrtxRes = await rpcApis.asyncTL('simpleSignRawTx', rawTx);
        if (ssrtxRes.error || !ssrtxRes.data || !ssrtxRes.data.complete || !ssrtxRes.data.hex) return this.emitError(ssrtxRes.error || `Error with signing the tx`);
        if (logs) console.log(`Signed RawTx ${ssrtxRes.data.hex}`);
        const _data = {
            commitTxs: [this.listenerCommitTx],
            signedRawTx: ssrtxRes.data.hex,
        };
        this._resultPromise.res(_data);
        this.client.disconnect();
    }
}