import client from 'socket.io-client';
import { rpcApis } from '../services/rpc-api.service';

class Receiver {
    constructor(listenerURL) {
        this._listenerUrl = listenerURL;
        this._initConnection();
    }

    _initConnection() {
        this.io = client.connect(this._listenerUrl);
        this.io.on('connect', () => this._handleAllListeners());
    }

    _handleAllListeners() {
        this.io.on('tradeRejection', this._onTradeRejection.bind(this));
        this.io.on('channelPubKey', this._onChannelPubKey.bind(this));
        this.io.on('multisig', this._onMultisig.bind(this));
        this.io.on('buildRawTx', this._onBuildRawTx.bind(this));
        this.io.on('readyForSending', this._onReadyForSending.bind(this));
        this.io.on('validCommits', this._onValidCommits.bind(this));
    }

    _onTradeRejection(data) {
        console.log(`Trade Rejection. Data: ${data}`);
    }

    _onChannelPubKey(data) {
        if (!data) return;
        this.listenerChannelPubKey = data;
        this._getNewAddress();
    }

    async _onMultisig(data) {
        const pubKeysArray = [this.listenerChannelPubKey, this.receiverChannelPubKey]
        const redeemScript = data.multisig.redeemScript
        const isLegit = await this._legitMultisig(pubKeysArray, redeemScript);
        if (!isLegit) return console.log(`Somebody tried to scam with a bad multisig !`);
        if (isLegit) {
            this.multySigAddress = data.multisig.address;
            this._receiverProcess();
        }
    }

    _onBuildRawTx(data) {
        console.log(`Build Raw Tx. Data: ${data}`);
    }

    _onReadyForSending(data) {
        console.log(`Ready for Sending. Data: ${data}`);
    }

    _onValidCommits(data) {
        console.log(`Valid Commits, Data ${data}`)
    }

    async _getNewAddress() {
        const getNewAddressResult = await rpcApis.rpcCall('getNewAddress', null);
        const getNewAddressData = getNewAddressResult.data;
        const getNewAddressError = getNewAddressResult.error;
        if (getNewAddressError) return console.log(getNewAddressError.message);
        if (getNewAddressData) {
            const validateAddressResult = await rpcApis.rpcCall('validateAddress', getNewAddressData);
            const validateAddressData = validateAddressResult.data;
            const validateAddressError = validateAddressResult.error;
            if (validateAddressError) return console.log(validateAddressError.message);
            if (validateAddressData) {
                this.receiverChannelPubKey = validateAddressData.data.pubkey;
                this.io.emit('channelPubKey', this.receiverChannelPubKey)
            }
        }
    }

    async _legitMultisig(pubKeysArray, redeemScript) {
        const addMultisigAddressResult = await rpcApis.rpcCall('addMultisigAddress', 2, [...pubKeysArray]);
        const addMultisigAddressData = addMultisigAddressResult.data
        const addMultisigAddressError = addMultisigAddressResult.error
        if (addMultisigAddressError) { 
            console.log(addMultisigAddressError.message); 
            return false;
        }
        if (addMultisigAddressData) {
            return addMultisigAddressData.redeemScript === redeemScript;
        }
    }

    _receiverProcess(){
        console.log('_receiverProcess')
    }
}

export class TokenPairTradeReceiver extends Receiver {
    tradeOptions = {
        offerTokenId: 4,
        offerTokenAmount: '0.006',
        wantedTokenId: 5,
        wantedTokenAmount: '0.05',
        address: 'QbbqvDj2bJkeZAu4yWBuQejDd86bWHtbXh',
    };

    constructor(listenerURL) {
        super(listenerURL);
        this.receiverAddress = this.tradeOptions.address;
        this._initTrade();
    }

    _initTrade() {
        const tradeOptions = {
            offerTokenId: this.tradeOptions.offerTokenId,
            offerTokenAmount: this.tradeOptions.offerTokenAmount,
            wantedTokenId:  this.tradeOptions.wantedTokenId,
            wantedTokenAmount: this.tradeOptions.wantedTokenAmount,
        };
        this.io.emit('requestTrade', tradeOptions);
    }

    async _receiverProcess() {
        this._commitToChannel();
    }

    async _commitToChannel() {
        const commitToChannelOptions = [ 
            this.receiverAddress,
            this.multySigAddress,
            this.tradeOptions.offerTokenId,
            this.tradeOptions.offerTokenAmount,
        ];
        const commitToChannelResult = await rpcApis.rpcCall('commitToChannel', ...commitToChannelOptions);
        const commitToChannelData = commitToChannelResult.data;
        const commitToChannelError = commitToChannelResult.error;
        if (commitToChannelError) return console.log(commitToChannelError.message);
        if (commitToChannelData) {
            this.receiverCommitTx = commitToChannelData;
            console.log({commitToChannelData});
        }
    }
}
