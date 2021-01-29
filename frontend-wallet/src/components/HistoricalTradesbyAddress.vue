<template>

  <md-table style="width: 100%;" md-card>
    <md-card-header>Your Recent Trades</md-card-header>
    <md-table-row>
      <md-table-cell>Raw TX</md-table-cell>
      <md-table-cell>TradeLayer TX</md-table-cell>
      <md-table-cell>Status</md-table-cell>
    </md-table-row>
    <md-table-row  v-if='lastRawTx'>
      <md-table-cell>{{lastRawTx ? `${lastRawTx.slice(0,8)}...${lastRawTx.slice(-8)}` : '' }}</md-table-cell>
      <md-table-cell>{{ lastTlTx ? `${lastTlTx.slice(0,8)}...${lastTlTx.slice(-8)}` : 'Not yet created !' }}</md-table-cell>
      <md-table-cell>{{ lastTxStatus }}</md-table-cell>
    </md-table-row>
  </md-table>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'HistoricalTrades',
  data () {
    return {
      txshow: false,
      tooltipActive: false,
      taker_txid: null
    }
  },
  computed: {
    ...mapState('orderbook', ['recent']),
    ...mapGetters('contracts', ['transactionsGetter', 'selectedContractGetter']),
    ...mapGetters('orderbook', ['recentByAddressGetter']),
    ...mapGetters('wallet', ['addressGetter', 'lastTxStatus', 'lastRawTx' , 'lastTlTx'])
  },
  mounted () {
    this.handleTrades()
  },
  methods: {
    ...mapActions('orderbook', ['getRecentTrades', 'postRecentTradesbyAddress']),
    handleTrades () {
      // var data = {
      //   contractID: this.selectedContractGetter,
      //   address: this.addressGetter
      // }
      // this.postRecentTradesbyAddress(data)
      // console.log('recent trades by address are ', this.recentByAddressGetter)
      // setInterval(() => {
      //   data = {
      //     contractID: this.selectedContractGetter,
      //     address: this.addressGetter
      //   }
      //   this.postRecentTradesbyAddress(data)
      // }, 2500)
    }
  }
}
</script>

<style scoped>
.mycolors-buy {
  color: #fff;
  background-color: #17a536;
}
.mycolors-sell {
  color: #fff;
  background-color: #d61d67;
}
.md-card-header {
  color: #d61d67;
}

.a {
  color: #FFF;
}

.button {
  border-radius: 50%;
  height: 10px;
  width: 10px;
  border: 1px solid #ddd;
  padding: 10px 10px;
}

.md-table-toolbar {
  padding: 0px 0px 0px 00px;
  margin: -10px 0px -20px 0px;
  text-align: center;
  font-size: 16px;

}

</style>
