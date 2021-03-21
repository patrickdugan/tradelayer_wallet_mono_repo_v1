<template>
  <div id="BuySellCard">
    <div class="md-layout animated jello">
           <md-card>
             <md-card-header>{{ getSelectedMarket.pair }}</md-card-header>
               <md-card-content >
                 <div class="inputs">
                    <md-field>
                      <label for="amount">Amount</label>
                      <md-input required v-model='amount' name="amount" id="amount" />
                      {{ getSelectedMarket.a.name }}
                    </md-field>
                    <md-field>
                      <label for="price">Price</label>
                      <md-input required v-model="price" name="price" id="price" />
                      {{ getSelectedMarket.b.name }}
                    </md-field>
                 </div>
                 <span v-if="hasError" style='color: red'>Error!</span>
            </md-card-content>
            <div class='buttons'>
              <button
                v-if='this.selectedMarketTypeName !== "LTC" && this.selectedMarketTypeName !== "USD"'
                @click="handleBuySell('BUY')"
                :disabled='!amount || !price'
                class='md-raised mycolors-buy animated rubberBand delay-3s'
              >Buy</button>
              <button
                @click="handleBuySell('SELL')"
                :disabled='!amount || !price'
                class='md-raised mycolors-sell animated rubberBand delay-3s'
              >Sell</button>
            </div>

          </md-card>
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
  data: () => {
    return {
    amount: null,
    price: null,
    hasError: false,
  }
  },
  computed: {
    ...mapGetters('markets', ['getSelectedMarket', 'selectedMarketTypeName']),
  },
  watch: {
    getSelectedMarket: {
      immediate: true,
      handler() {
        this.clearInputs();
      }
    },
  },  
  methods: {
    ...mapActions('trades', ['initTrade']),
    handleBuySell (action) {
      if (!this.isNumber(this.amount) || !this.isNumber(this.price)) {
        this.hasError = true
        return;
      }
      const tradeOptions = {
        amount: this.amount,
        price: this.price,
        market: this.getSelectedMarket,
        marketType: this.selectedMarketTypeName,
        action,
      }
      this.initTrade(tradeOptions)
      this.hasError = false;
    },
    isNumber(value) {
      return !isNaN(value) && !isNaN(parseFloat(value));
    },
    clearInputs() {
      this.amount = null
      this.price = null;
    }
  },
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
    filter: grayscale(0.8)
}

.md-card {
  padding:10px;
  border-radius: 50%;
  width: 350px;
  height: 350px;
}

.inputs {
  width: 70%;
  margin: 0 auto;
}
.md-card-header {
  color: #d61d67;
  font-size: 1.15rem;
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
