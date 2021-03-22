<template>
  <div v-if="walletDec[currentAddressIndex]">
    <div id='wallet-header'> 
      <span>addresses </span> 
      <span id='wallet-balance' v-on:click='updateCurrentUTXOs'> 
        <md-tooltip md-direction='bottom'>
          click to update balance 
        </md-tooltip>
        balance: {{ currentAddressLTCBalance }}
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
            <md-select v-model="selectedTxnType" >
              <md-option :value="txnType.LTC_INSTANT">LTC Instant Trade</md-option>
              <md-option :value="txnType.TOKEN_TOKEN">Token/Token Trade</md-option>
              <md-option :value="txnType.USD_TRADE">USD Trade</md-option>
              
            </md-select>
          </md-field>
        </div>
  
      <div class='divider' />
      <div class='form-group'>
        <md-field>
                <label>Sender Address:</label>
                <md-input required v-model="senderAddress"></md-input>
                <span class="md-helper-text pointer" v-on:click='copyWalletAddress()'>(Use wallet address)</span>
        </md-field>
        <div style='display:flex; justify-content: space-between'>
            <md-field style='width:100%'>
                <label>Amount:</label>
                <md-input v-model='amountDesired'></md-input>
                <span>{{ tokenDesired.name || getSelectedMarket.a.name }}</span>
            </md-field>
            </div>
            <div style='display:flex; justify-content: space-between'>
            <md-field style='width:100%'>
                <label>Price: </label>
                <md-input v-model='amountForSale'></md-input>
                <span>{{ tokenForSale.name || getSelectedMarket.b.name }}</span>
            </md-field>
        </div>
      </div>
    </div>
    <div class='divider' />
    <div class="buttons">
      <md-button
        md-button 
        class='md-accent md-raised' 
        v-on:click="handleBuildRawTx()" 
      > 
        Build TX
      </md-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState, mapActions } from "vuex";
import { txnType } from "../store/txns.module"

export default {
  name: "Wallet",
  data: () => ({
    txnType,
    senderAddress: null,
    amountDesired: 0,
    amountForSale: 0,
    tokenDesired: '',
    tokenForSale: '',
  }),
  computed: {
    ...mapState("wallet", ["walletDec", "currentAddressIndex"]),
    ...mapGetters("wallet", ["currentAddressLTCBalance"]),
    ...mapGetters("txns", [
      "getSelectedTxnType", 
      "getTokenForSale", 
      'getTokenDesired', 
      'getAmountForSale', 
      'getAmountDesired',
      ]),
    ...mapGetters("markets", ["getMarketsTypes", "getSelectedMarket"]),
    selectedTxnType: {
      get() {
        return this.getSelectedTxnType;
      },
      set(value) {
        this.setSelectedTxnType(value);
      }
    },
    LTCmarkets() {
        return this.getMarketsTypes.find(m => m.name === 'LTC')
            .markets.map(m => m.a);
    }
  },
  watch: {
    getAmountForSale(v) {
      this.amountForSale = v;
    },
    getAmountDesired(v) {
      this.amountDesired = v
    },
    getTokenDesired(v) {
      this.tokenDesired = v
    },
    getTokenForSale(v) {
      this.tokenForSale = v
    },
  },
  methods: {
    ...mapActions("wallet", ["setCurrentAddress"]),
    ...mapActions("txns", ["buildRawTx"]),
    ...mapMutations("txns", ["setSelectedTxnType"]),
    updateCurrentUTXOs() {
      console.log('updateCurrentUTXOs');
    },
    copyWalletAddress() {
      this.senderAddress = this.walletDec[this.currentAddressIndex].publicAddress
    },
    handleBuildRawTx() {
      console.log('Build Raw Tx');
      const options = {
        address: this.senderAddress,
        amountDesired: this.amountDesired,
        amountForSale: this.amountForSale,
        tokenDesired: this.tokenDesired.id,
        tokenForSale: this.tokenForSale.id,
        type: this.getSelectedTxnType,
      };
      this.buildRawTx(options)
    }
  },
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
