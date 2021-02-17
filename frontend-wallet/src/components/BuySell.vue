<template>
  <div id="BuySellCard">
    <div class="md-layout animated jello">
     <div class="">
           <md-card>
             <md-card-header>
                {{ 
                  selectedContract.propsNameForSale && selectedContract.propsNameDesired 
                  ? selectedContract.propsNameForSale + '/' + selectedContract.propsNameDesired 
                  : "Please select Contract"
                }}
              </md-card-header>
               <md-card-content v-if='scType === "pairContract"'>
                   <md-field>
                        <label for="quantity">{{selectedContract.propsNameForSale}}</label>
                        <md-input name="quantity" id="quantity" v-model="form.quantity" />
                        <span class="md-helper-text" style='cursor: pointer' v-on:click='form.quantity=max'>Max.:{{max}}</span>
                    </md-field>
                   <md-field>
                      <label for="price">{{selectedContract.propsNameDesired}}</label>
                      <md-input name="price" id="price"  v-model="form.price" />
                    </md-field>
                  <div class="md-layout-item">
                    <button @click="handleWalletBuy" class='md-raised mycolors-buy animated rubberBand delay-3s'>Buy</button>
                    <button @click="handleWalletSell" class='md-raised mycolors-sell animated rubberBand delay-3s'>Sell</button>
                  </div>
                  <br/>
                  <!-- <div v-if='lastTXID'>
                    Last txId: <br />{{lastTXID}}
                  </div>
                  <div v-if='message'>
                    Error: <br />
                    <span style="color:red">{{message}}</span>
                  </div> -->
            </md-card-content>
            <md-card-content v-if='scType === "LTC_instant"'>
                   <md-field>
                        <label for="movie">Token</label>
                        <md-select v-model="formLTCINSTANT.selectedToken" name="token" id="token">
                          <md-option value='4'>Wood</md-option>
                          <md-option value='5'>Gold</md-option>
                        </md-select>
                    </md-field>
                   <md-field>
                      <label for="price">Amount</label>
                      <md-input name="quntity"  v-model="formLTCINSTANT.amount" />
                    </md-field>
                      <md-field>
                        <label for="price">LTC amount</label>
                      <md-input name="price" v-model="formLTCINSTANT.ltc" />
                    </md-field>
                  <div class="md-layout-item">
                    <button @click="handleWalletBuy" class='md-raised mycolors-buy animated rubberBand delay-3s'>Buy</button>
                  </div>
            </md-card-content>
          </md-card>
     </div>
   </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
import { required, between } from 'vuelidate/lib/validators'
import { walletService } from "../services";
const {txnTypeEnum} = walletService

export default {
  name: 'BuySell',
  data: () => ({
    scType: null,
    txid: null,
    sending: false,
    formLTCINSTANT: {
      selectedToken: null,
      amount: 0,
      ltc: 0,
    },
    form: {
      orderType: null,
      quantity: 0,
      price: 0,
      contractCurrency: 'Contracts',
      leverage: 1
    },
    tooltipActive: false,
    max: 0,
  }),
  computed: {
    ...mapState('contracts', ['lastTXID', 'selectedContract', 'pendingTXIDsGetter']),
    ...mapState('alert', ['message']),
    ...mapGetters("orderbook", ["selectedOrder"]),
    ...mapGetters('wallet', ['addressGetter'])
  },
  validations: {
    form: {
      contractCurrency: {
        required
      },
      orderType: {
        required
      },
      price: {
        required,
        between: between(0, 10000000)
      },
      quantity: {
        required,
        between: between(0, 1000000)
      }
    }
  },
  created () {
  },
  watch: {
    selectedContract: {
      immediate: true,
      handler() {
        console.log(this.selectedContract.type);
        this.scType = this.selectedContract.type
      }
    },
    selectedOrder: {
      immediate: true,
      handler() {
        this.form.price = (this.selectedOrder.price && this.selectedOrder.quantity)
        ? this.selectedOrder.quantity / (this.selectedOrder.price * this.selectedOrder.quantity)
        : 0

        this.form.quantity = (this.selectedOrder.price && this.selectedOrder.quantity)
        ? this.selectedOrder.quantity * this.selectedOrder.price
        : 0

        this.handleMaxValue();
      }
    }
  },
  methods: {
    ...mapActions('contracts', ['buyContracts', 'sellContracts', 'postCancelTrades', 'addPendingTXID', 'asyncGetTokenAmount']),
    ...mapMutations('wallet', ['setBuyOrSellContract', 'setLTCInstantContract']),

    async handleMaxValue() {
      const balance = await this.asyncGetTokenAmount(this.selectedOrder.propertyId)
      const quantity = this.selectedOrder.quantity * this.selectedOrder.price
        console.log(quantity,balance)
      const max = !quantity ? 0 : quantity > balance ? balance : quantity
      this.max = max ? max : 0
    },
    getValidationClass (fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    handleWalletBuy(){
      switch (this.scType) {
        case 'pairContract':
          this.handleBuySellTrade();
          break;
        case 'LTC_instant':
          this.handleLTCInstantTrade()
          break;
        default:
          break;
      }
    },
    handleBuySellTrade(){
      const { form, selectedContract, setBuyOrSellContract } = this
      this.setBuyOrSellContract({
        txnType: txnTypeEnum.BUY_CONTRACT,
        quantity: form.quantity,
        price: form.price,
        contract: selectedContract 
      })
    },
    handleLTCInstantTrade() {
      this.setLTCInstantContract({
        txnType: txnTypeEnum.LTC_INSTANT_TRADE,
        selectedToken: this.formLTCINSTANT.selectedToken,
        amount: this.formLTCINSTANT.amount,
        ltcAmount: this.formLTCINSTANT.ltc,
      })
    },
    handleWalletSell(){
      const { form, selectedContract, setBuyOrSellContract } = this
      this.setBuyOrSellContract({
        txnType: txnTypeEnum.SELL_CONTRACT,
        quantity: form.quantity,
        price: form.price,
        contract: selectedContract 
      })
    },
    handleBuy (e) {
      const { form } = this

      this.buyContracts(form).then((data) => {
        this.lastTXID = data.lastTXID
        console.log('this is pending TXIDs in buysell ', this.pendingTXIDsGetter)
        var TXIDinPending
        if (this.pendingTXIDsGetter) {
          TXIDinPending = this.pendingTXIDsGetter.filter((txid) => {
            return this.lastTXID === TXIDinPending
          })
        }

        if (!TXIDinPending || TXIDinPending === null) {
          console.log('called add pending from buysell')
          this.addPendingTXID(this.lastTXID)
        }

        alert('Your order is Pending.  You can check the Pending tab.')

        console.log('last TX id is', this.lastTXID)
      })
    },
    handleSell (e) {
      const { form } = this
      console.log('this is the context ', form)
      this.sellContracts(form).then((data) => {
        this.lastTXID = data.lastTXID
        this.addPendingTXID(data.lastTXID)
        console.log('last TX id is', this.lastTXID)
        alert('Your order is Pending.  You can check the Pending tab.')
      })
    },
  }
}
</script>

<style scoped>
button {
  border-radius: 50%;
  height: 60px;
  width: 60px;
  padding: 10px 10px;
  margin: 0px 10px;
  border: 1px solid #ddd;
  color: #fff;
  background-color:#fff;
  font-size: 16px;

  cursor: pointer;
}
  button[disabled]{
    cursor: not-allowed;
  }
.md-card {
  padding:10px;
  border-radius: 50%;
  width: 350px;
  height: 350px;
}

.md-field {
  width: 100px;
  display: inline-block;
}

@media only screen and (max-width: 768px) {

  .md-card {
    padding:10px;
    border-radius: 50%;
    width: 390px;
  }

  .md-field {
    width: 130px;
    display: inline-block;
  }

}

.md-table-row {

}

.md-table-cell {

}

.md-layout-item {
}

.md-card-header {
  color: #d61d67;
}

.mycolors-button {
  color: #F0A28E;
}

.mycolors-buy {
  color: #fff;
  background-color: #17a536;
}
.mycolors-sell {
  color: #fff;
  background-color: #d61d67;
}
</style>
