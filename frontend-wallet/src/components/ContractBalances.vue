<template>
  <div class="md-layout" >
    <md-table md-card style="width:100%">
    <md-table-row v-if="tokenDesired">
        <md-table-cell md-label="Symbol" >{{tokenDesired.name}}</md-table-cell>
        <md-table-cell md-label="Symbol" >{{tokenDesired.amount}}</md-table-cell>
    </md-table-row>
    <md-table-row v-if="tokenForSale">
        <md-table-cell md-label="Symbol" >{{tokenForSale.name}}</md-table-cell>
        <md-table-cell md-label="Symbol" >{{tokenForSale.amount}}</md-table-cell>
    </md-table-row>
    </md-table>
  </div>
</template>
<script>
import {mapState, mapActions, mapGetters} from 'vuex'

export default {
  name: 'ContractBalances',
  data () {
    return { 
        tokenForSale: {
          name: '',
          amount: 0
        },
        tokenDesired: {
          name: '',
          amount: 0
        },
    }
  },
  computed: {    
      ...mapGetters("contracts", ["selectedContractGetter"]),
      ...mapGetters("markets", ["getSelectedMarket"]),
      ...mapGetters("wallet", ["getTokens", "getLtcAvailable"]),
 },
 watch: {
    // selectedContractGetter: {
    //   immediate: true,
    //   handler() {
    //       this.asyncGetAmountsHandler()

    //   }
    // },
    getSelectedMarket: {
      immediate: true,
      handler(market) {
        this.populateTokensAmounts(market);
      }
    }
  },
  created () { },
  methods: {
    ...mapActions("contracts", ["asyncGetTokenAmount", "asyncGetTokenName"]),

    async asyncGetAmountsHandler(){
        const { propsIdDesired, propsIdForSale } = this.selectedContractGetter;
        this.tokenDesired.name = await this.asyncGetTokenName(propsIdDesired)
        this.tokenDesired.amount = await this.asyncGetTokenAmount(propsIdDesired)

        this.tokenForSale.name = await this.asyncGetTokenName(propsIdForSale)
        this.tokenForSale.amount = await this.asyncGetTokenAmount(propsIdForSale)
    },
    populateTokensAmounts(market) {
      this.tokenDesired.name = market.a.name;
      this.tokenForSale.name = market.b.name;
      const findTokenById = (id) => {
        const token = this.getTokens.find(t => t.propertyid === market[id].id);
        return token ? token.balance : 0;
      }
      const amountA = findTokenById("a");
      const amountB = market.b.id === 1 ? this.getLtcAvailable : findTokenById("b");
      this.tokenDesired.amount = amountA;
      this.tokenForSale.amount = amountB;
    }
  }
}

</script>

<style scoped>

</style>
