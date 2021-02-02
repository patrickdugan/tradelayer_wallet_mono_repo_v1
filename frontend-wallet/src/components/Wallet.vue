<template>
  <div v-if="walletDec[currentAddressIndex]">
  
    <div id='wallet-header'> 
      <span>addresses </span> 
      <span id='wallet-balance' v-on:click='updateCurrentUTXOs'> 
        <md-tooltip md-direction='bottom'>
          click to update balance 
        </md-tooltip>
        balance: {{currentAddressLTCBalance}}
      </span>
    </div>

    <div class='addresses-container'>
      <div 
      class='address' 
      v-bind:class="{ 'active-address': currentAddressIndex == index }"
      v-bind:key="item.publicAddress" v-for="(item, index) in walletDec"
      v-on:click='setCurrentAddress(index)'>
         {{ item.publicAddress }} 
      </div>
    </div>
  
    <div class='divider' />

    <div id='txn-container'>
      
        <div class='form-group'>
          <md-field>
            <md-select v-model="txnType" >
              <md-option :value="this.txnTypeEnum.SIMPLE_SEND">Simple Send</md-option>
              <md-option :value="this.txnTypeEnum.CUSTOM_PAYLOAD">Custom Payload</md-option>
              <md-option :value="this.txnTypeEnum.BUY_CONTRACT">Buy</md-option>
              <md-option :value="this.txnTypeEnum.SELL_CONTRACT">Sell</md-option>
            </md-select>
          </md-field>
        </div>
  
      <div class='divider' />

      <div v-if="txnType === txnTypeEnum.SIMPLE_SEND">
        <div class='form-group'>
          <div class='check-boxes'>
              <md-checkbox v-on:change="clearInputs()" v-model='useCustomTXO'>Use Custom Transaction Input</md-checkbox>
          </div>
          <md-field v-if='!useCustomTXO'>
            <label>Sender Address:</label>
            <md-input required v-model='fromAddress'></md-input>
            <span class="md-helper-text pointer" v-on:click='copyWalletAddress()'>(Use wallet address)</span>
          </md-field>
          <md-field v-if='useCustomTXO'>
            <label>Transaction Input:</label>
            <md-input required v-model='customTxInput'></md-input>
          </md-field>
          <md-field v-if='useCustomTXO'>
            <label>Input's vOut:</label>
            <md-input required v-model='vOut' type='number'></md-input>
          </md-field>
          <md-field >
            <label>Receiver Address:</label>
            <md-input required v-model='toAddress'></md-input>
          </md-field>
          <md-field >
            <label>Property ID: </label>
            <md-input v-model='propertyId' required type='number'></md-input>
          </md-field>
          <md-field >
            <label>Quantity: </label>
            <md-input v-model='quantity' required type='number'></md-input>
          </md-field>
        </div>
      </div>

      <div v-if="txnType === txnTypeEnum.CUSTOM_PAYLOAD">
        <div class='form-group'>
          <md-field >
            <label>Transaction Input:</label>
            <md-input v-model='customTxInput' required></md-input>
          </md-field>
          <md-field >
            <label>Input's vOut:</label>
            <md-input v-model='vOut' required type='number'></md-input>
          </md-field>
          <md-field >
            <label>Refferance Address:</label>
            <md-input v-model='toAddress' required></md-input>
          </md-field>
          <md-field >
            <label>payload:</label>
            <md-input v-model='payload' required></md-input>
          </md-field>
        </div>
      </div>

      <div v-if="(txnType === txnTypeEnum.BUY_CONTRACT || txnType === txnTypeEnum.SELL_CONTRACT) && selectedContract.id">
        <div class='form-group'>
          <md-field v-if='!useCustomTXO'>
            <label>Sender Address:</label>
            <md-input required v-model='fromAddress'></md-input>
            <span class="md-helper-text pointer" v-on:click='copyWalletAddress()'>(Use wallet address)</span>
          </md-field>
          <div style='display:flex; justify-content: space-between'>
          <md-field style='width: 60%'>
            <label>Token For Sale:</label>
            <md-select disabled :value="txnType === txnTypeEnum.SELL_CONTRACT ? selectedContract.propsIdForSale : selectedContract.propsIdDesired">
              <md-option :value="selectedContract.propsIdForSale">{{ selectedContract ? selectedContract.propsNameForSale : '' }} </md-option>
              <md-option :value="selectedContract.propsIdDesired">{{ selectedContract ? selectedContract.propsNameDesired: '' }} </md-option>
            </md-select>
          </md-field>
          <md-field style='width:30%'>
            <label>Quantity:</label>
            <md-input disabled type='number' :value="txnType === txnTypeEnum.SELL_CONTRACT ? amount1 : amount2"></md-input>
          </md-field>
          </div>
          <div style='display:flex; justify-content: space-between'>
          <md-field style='width: 60%'>
            <label>Token Desired:</label>
            <md-select disabled :value="txnType === txnTypeEnum.SELL_CONTRACT ? selectedContract.propsIdDesired : selectedContract.propsIdForSale">
              <md-option :value="selectedContract.propsIdForSale">{{ selectedContract ? selectedContract.propsNameForSale : '' }} </md-option>
              <md-option :value="selectedContract.propsIdDesired">{{ selectedContract ? selectedContract.propsNameDesired: '' }} </md-option>
            </md-select>
          </md-field>
          <md-field style='width:30%'>
            <label>Quantity:</label>
            <md-input disabled type='number' :value="txnType === txnTypeEnum.SELL_CONTRACT ? amount2 : amount1"></md-input>
          </md-field>
          </div>
        </div>
      </div>

               <div class='divider' />

      <div>

          <md-button
            v-if="(txnType === txnTypeEnum.BUY_CONTRACT || txnType === txnTypeEnum.SELL_CONTRACT) && selectedContract.id"
            md-button 
            class='md-accent md-raised' 
            v-on:click="handleBuildRawTx()" 
            :disabled='isDisabled()'
          > 
            SEND
          </md-button>
          <md-button
            v-if="txnType === txnTypeEnum.CUSTOM_PAYLOAD || txnType === txnTypeEnum.SIMPLE_SEND"
            md-button 
            class='md-accent md-raised' 
            v-on:click="handleBuildRawTx()" 
            :disabled='isDisabled()'
          > 
            Build Raw 
          </md-button>
          <md-button 
            v-if="txnType === txnTypeEnum.CUSTOM_PAYLOAD || txnType === txnTypeEnum.SIMPLE_SEND"
            md-button 
            class='md-primary md-raised'
            v-on:click="!signedRawTx ? handleSignRawTx(unSignedRawTx) : handleSendRawTx(signedRawTx)" 
            :disabled="!signedRawTx ? !unSignedRawTx : !signedRawTx" 
          >
            {{ !signedRawTx ? 'SIGN' : 'SEND' }}
          </md-button>
          <textarea 
          v-if="selectedContract.id"
          class='nice-textarea' 
          type='text-area'
          :value='buildRawTxMessage'
          readonly />  
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState, mapActions } from "vuex";
import { createTxn, signTxn } from "../../lib/wallet.js";
import { walletService, socketService } from "../services";

const { txnTypeEnum } = walletService

export default {
  name: "Wallet",
  data: () => ({
    showDialog: true,
    txnTypeEnum,
    useCustomTXO: false,
    toAddress: '',
    fromAddress: '',
    customTxInput: '',
    vOut: null,
    payload: '',
    propertyId: null,
    quantity: null,
    propsIdDesired: null,
    propsIdForSale: null,
    amountDesired: null,
    amountForSale: null,
  }),
  computed: {
    ...mapState("wallet", [
      "walletDec",
      "currentAddressIndex",
      "currentTxnType",
      "buildRawTxMessage",
      "unSignedRawTx",
      "signedRawTx",
    ]),
    ...mapGetters("wallet", ["addressGetter", "currentAddressLTCBalance", "amount1", "amount2"]),
    ...mapState("contracts", ["selectedContract"]),

    txnType: {
      get(){
        return this.currentTxnType
      }, 
      set(value){
        this.setCurrentTxnType(value);
        this.clearInputs();
      }
    }
  },
  methods: {
    ...mapMutations("wallet", [
      "setCurrentTxnType", 
      "setSignedRawTx", 
      "setUnsignedRawTx",
      ]),
    ...mapActions("wallet", [
      "setCurrentAddress", 
      "updateCurrentUTXOs", 
      "createCustomRawTx", 
      "createSimpleSendRawTx",
      "signRawTx",
      "sendRawTx",
      ]),
    ...mapActions("channelsTrade", ["createSocketTrade"]),
    copyWalletAddress() {
        this.fromAddress = this.walletDec[this.currentAddressIndex].publicAddress;
    },
    isDisabled() {
      switch (this.currentTxnType) {
        case txnTypeEnum.CUSTOM_PAYLOAD:
          return !this.customTxInput || !this.vOut || !this.toAddress || !this.payload
        case txnTypeEnum.SIMPLE_SEND:
          return (
          (this.useCustomTXO ? (!this.vOut || !this.customTxInput) : !this.fromAddress) 
          || !this.toAddress 
          || !this.propertyId 
          || !this.quantity);
        case txnTypeEnum.SELL_CONTRACT:
        case txnTypeEnum.BUY_CONTRACT:
          return !this.fromAddress
        default:
          return true;
      }
    },

    async handleBuildRawTx() {
      const { 
        useCustomTXO,
        toAddress,
        fromAddress,
        customTxInput,
        vOut,
        payload,
        propertyId,
        quantity,
        currentTxnType,
        } = this;
      
      switch (currentTxnType) {
        case txnTypeEnum.CUSTOM_PAYLOAD:
          const rawTxResult = await this.createCustomRawTx({
            customTxInput,
            vOut,
            toAddress,
            payload,
          });
          break;
        case txnTypeEnum.SIMPLE_SEND:
          this.createSimpleSendRawTx({
            fromAddress,
            propertyId,
            quantity,
            customTxInput, 
            vOut,
            toAddress,
          });
          break;
        case txnTypeEnum.BUY_CONTRACT:
        case txnTypeEnum.SELL_CONTRACT:
          this.handleBuySellSubmit();
          break;
        default:
          break;
      }
    },
    async handleSignRawTx(rawTx) {
      this.signRawTx(rawTx);
      this.setUnsignedRawTx('');
    },
    async handleSendRawTx(rawTx) {
      this.sendRawTx(rawTx);
      this.setSignedRawTx('');
    },
    clearInputs() {
      this.toAddress ='';
      this.fromAddress = '';
      this.customTxInput = '';
      this.vOut = null;
      this.payload = '';
      this.propertyId = null;
      this.quantity = null;
    },
    handleBuySellSubmit() {
      const sc = this.selectedContract
        const fromAddress = this.fromAddress
        const propsIdForSale = this.txnType === txnTypeEnum.SELL_CONTRACT ? sc.propsIdForSale : sc.propsIdDesired;
        const propsIdDesired = this.txnType === txnTypeEnum.SELL_CONTRACT ? sc.propsIdDesired : sc.propsIdForSale;
        const amountForSale = this.txnType === txnTypeEnum.SELL_CONTRACT ? this.amount1 : this.amount2
        const amountDesired = this.txnType === txnTypeEnum.SELL_CONTRACT ? this.amount2 : this.amount1
        this.createSocketTrade({ propsIdDesired, propsIdForSale, amountForSale, amountDesired, fromAddress })
    }
  //   handleLTCSubmit() {
  //     if (this.currentTxnType !== txnTypeEnum.LTC_SEND)return
  //     if(!confirm('Are you sure you want to sign and broadcast this transaction')) return
  //     let { utxoArray, toAddress, sats, walletDec, currentAddressIndex } = this;

  //     let { publicAddress, wifKey } = walletDec[currentAddressIndex];

  //     const txn = createTxn(utxoArray, toAddress, +sats, publicAddress);
  //     const signedTxn = signTxn(txn, wifKey).serialize()
      
  //     walletService.sendRawTxn(signedTxn).then((data)=>{
  //       console.log(data);
  //     })
  //   },
  //   handleBuySellSubmit(){
  //   const address = this.walletDec[this.currentAddressIndex].publicAddress;
  //   const {BUY_CONTRACT, SELL_CONTRACT} = txnTypeEnum
  //   const { propsIdForSale, propsIdDesired } = this.selectedContract
  //   const data = {};
  //   if (this.currentTxnType === SELL_CONTRACT) {
  //     data.address = address
  //     data.propsIdForSale = propsIdForSale;
  //     data.amountforsale = parseFloat(this.quantity);
  //     data.propsIdDesired = propsIdDesired;
  //     data.amountdesired = parseFloat(this.quantity) * parseFloat(this.price);
  //   }
  //   if (this.currentTxnType === BUY_CONTRACT) {
  //     data.address = address
  //     data.propsIdForSale = propsIdDesired;
  //     data.amountforsale = parseFloat(this.quantity);
  //     data.propsIdDesired = propsIdForSale;
  //     data.amountdesired = parseFloat(this.quantity) * parseFloat(this.price);
  //   }
  //     this.sendtrade(data);
  //     window.toggleWallet();
  //   return
  //   },
  //   handleIssueRedeemSubmit(){
  //     // placeholder
  //     return
  //   },
  //   handleProposeChannel(){
      
  //     const {   quantity, channelPrice, channelBalance, currentAddressIndex, walletDec} = this
  //      let { publicAddress } = walletDec[currentAddressIndex];
       
  //      socketService.proposeChannel({
  //        marginBalance: channelBalance,
  //         quotePrice: channelPrice,
  //         unpublishedTradeSize: quantity,
  //         address: publicAddress
  //      })
       
  //   },
  //   handleSubmit(e) {
  //     if(!confirm('Are you sure you want to sign and broadcast this transaction')) return

  //     const {currentTxnType, handleLTCSubmit, handleIssueRedeemSubmit, handleBuySellSubmit,handleProposeChannel} = this
  //     const {LTC_SEND,  BUY_CONTRACT, SELL_CONTRACT, ISSUE_CURRENCY, REDEEM_CURRENCY, PROPOSE_CHANNEL} = txnTypeEnum

  //     switch (currentTxnType) {
  //       case  LTC_SEND:
  //         return handleLTCSubmit();
  //       case BUY_CONTRACT:
  //       case SELL_CONTRACT:
  //         return handleBuySellSubmit()
  //       case ISSUE_CURRENCY:
  //         return getSendIssuancePeggedPayload(/*datahere*/).then(this.handleOpReturnPayload)
  //       case REDEEM_CURRENCY:
  //         return handleIssueRedeemSubmit()
  //       case PROPOSE_CHANNEL:
  //         return handleProposeChannel()
  //       default:
  //         break;
  //     }
     
  //   },
  //   handleOpReturnPayload(txn){
  //      const signedTxn = signTxn(txn, wifKey).serialize()
      
  //     walletService.sendRawTxn(signedTxn).then((data)=>{
  //       console.log(data);
  //     })
  //   },
  //   txnFormUpdate(e) {
  //     const { name, value } = e.target;
  //     this.setTxnState({
  //       key: name,
  //       value
  //     });
  //   },
  }
};
</script>

<style scoped>
.nice-textarea {
    background-color: black;
    padding: 0.5rem 1rem;
    border:unset;
    overflow:auto;
    color:green;
    width: 90%;
    max-width: 90%;
    min-width:40%;
    margin: 1rem 0;
    height: 100%;
    min-height: 15rem;
}
.update-button, .submit-button{
  border: 1px solid grey;
  border-radius: 20%;
}

#header{
  text-align: left;
  padding-left: 35px;
  padding-bottom: 20px;

}
.divider{
  border-top: 1px solid rgb(32, 32, 32);
  box-shadow: 0 0 2px 1px rgb(32, 32, 32);
  width: 100%;
  margin: 0.5rem 0;
}
.form-group {
  padding: 0 2rem
}
.form-wrapper {
  display: flex;
  flex-direction: column
}

#wallet-balance{
  cursor: pointer;
}

#wallet-header{
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  font-weight: bold;
  font-size: 17px;
  background-color: rgb(32, 32, 32);
  box-shadow: 0 1px 5px black;
}

.addresses-container {
  max-height: 200px;
  display:flex;
  flex-direction: column;
  margin: 0.5rem 0;
  overflow: auto;
}
.address {
  margin: 0.3rem 0;
  cursor: pointer;
}
.address:hover {
  color: yellowgreen;
}
.active-address{ 
  color: skyblue
}
.check-boxes {
  text-align: start;
}
.pointer {
  cursor: pointer;
}
</style>
