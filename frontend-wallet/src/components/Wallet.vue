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
              <!-- <md-option :value="this.txnTypeEnum.SIMPLE_SEND">Simple Send</md-option>
              <md-option :value="this.txnTypeEnum.CUSTOM_PAYLOAD">Custom Payload</md-option>
              <md-option :value="this.txnTypeEnum.BUY_CONTRACT">Buy</md-option>
              <md-option :value="this.txnTypeEnum.SELL_CONTRACT">Sell</md-option> -->
              <md-option :value="txnType.LTC_INSTANT">LTC Instant Trade</md-option>
              <md-option :value="txnType.TOKEN_TOKEN">Token/Token Trade</md-option>
              
            </md-select>
          </md-field>
        </div>
  
      <div class='divider' />
      
      <!-- <div v-if="txnType === txnTypeEnum.SIMPLE_SEND">
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
      </div> -->

      <!-- <div v-if="txnType === txnTypeEnum.CUSTOM_PAYLOAD">
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
      </div> -->

      <!-- <div v-if="txnType === txnTypeEnum.LTC_INSTANT_TRADE">
        <div class="form-group">
           <md-field v-if='!useCustomTXO'>
            <label>Sender Address:</label>
            <md-input required v-model='fromAddress'></md-input>
            <span class="md-helper-text pointer" v-on:click='copyWalletAddress()'>(Use wallet address)</span>
          </md-field>
           <div style='display:flex; justify-content: space-between'>
          <md-field style='width: 60%'>
            <label>Wanted Token:</label>
            <md-select disabled :value="selectedToken">
              <md-option :value="4">Wood</md-option>
              <md-option :value="5">Gold </md-option>
            </md-select>
          </md-field>
          <md-field style='width:30%'>
            <label>Quantity:</label>
            <md-input disabled type='number' :value="amount1"></md-input>
          </md-field>
          </div>
          <div style='display:flex; justify-content: space-between'>
          <md-field style='width:100%'>
            <label>LTC amount:</label>
            <md-input disabled type='number' :value="amount2"></md-input>
          </md-field>
        </div>
        </div>
      </div> -->

      <!-- <div v-if="(txnType === txnTypeEnum.BUY_CONTRACT || txnType === txnTypeEnum.SELL_CONTRACT) && selectedContract.id">
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
      </div> -->

    <!-- <div class='divider' />

      <div>

          <md-button
            v-if="(txnType === txnTypeEnum.BUY_CONTRACT || txnType === txnTypeEnum.SELL_CONTRACT || txnType === txnTypeEnum.LTC_INSTANT_TRADE) && selectedContract.id"
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
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState, mapActions } from "vuex";
import { walletService } from "../services";
import { txnType } from "../store/txns.module"

export default {
  name: "Wallet",
  data: () => ({
    txnType,
  }),
  computed: {
    ...mapState("wallet", ["walletDec", "currentAddressIndex"]),
    ...mapGetters("wallet", ["currentAddressLTCBalance"]),
    ...mapGetters("txns", ["getSelectedTxnType"]),
    selectedTxnType: {
      get() {
        return this.getSelectedTxnType;
      },
      set(value) {
        this.setSelectedTxnType(value);
      }
    }
  },
  methods: {
    ...mapActions("wallet", ["setCurrentAddress"]),
    ...mapMutations("txns", ["setSelectedTxnType"]),
    updateCurrentUTXOs() {
      console.log('updateCurrentUTXOs')
    }
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
