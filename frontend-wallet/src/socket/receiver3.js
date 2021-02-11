import io from 'socket.io-client';
import { rpcApis } from '../services/rpc-api.service';

const logs = true;


const EmitTypes = {
    TRADE_REQUEST: 'TRADE_REQUEST',
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
};

const OnTypes = {
    CHANNEL_PUB_KEY: 'CHANNEL_PUB_KEY',
    TRADE_REJECTION: 'TRADE_REJECTION',
    MULTYSIG_DATA: 'MULTYSIG_DATA',
}


export default class Receiver {
    constructor(listenerURL) {
        this.tradeOptions = { 
            offerTokenId: 4,
            offerTokenAmount: '0.003', 
            wantedTokenId: 5,
            wantedTokenAmount: '0.0156' ,
        };
        this.listenerUrl = listenerURL;
        this.initConnection();
    }

    initConnection() {
        this.client = io.connect(this.listenerUrl);
        this.client.on('connect', this.connected.bind(this));
    }

    connected() {
        if (logs) console.log(`Connected to: ${this.listenerUrl}`);
        this.handleListeners();
        this.initTrade();
    }

    handleListeners() {
        this.client.on(OnTypes.TRADE_REJECTION, this.onTradeRejection.bind(this));
        this.client.on(OnTypes.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));
        this.client.on(OnTypes.MULTYSIG_DATA, this.onMultySigData.bind(this))


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
        if (!isValid) return console.error('Wribg MyltySig Data Provided !');
        this.multySigChannelData = data;
    }

    initTrade() {
        if (logs) console.log(`Init Trade`);
        const { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount } = this.tradeOptions;
        const tradeOptions = { offerTokenId, offerTokenAmount, wantedTokenId, wantedTokenAmount };
        this.client.emit(EmitTypes.TRADE_REQUEST, tradeOptions);
        if (logs) console.log(`Sended Trade Request ${JSON.stringify(tradeOptions)}`);
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