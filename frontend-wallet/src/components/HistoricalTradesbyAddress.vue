<template >
  <md-table style='text-align: left'>
        <md-table-row>
          <md-table-head style='width: 1rem'>#</md-table-head>
          <md-table-head>Raw TX</md-table-head>
          <md-table-head>TradeLayer TX</md-table-head>
          <md-table-head>Status</md-table-head>
        </md-table-row>
    <md-table-row v-if='lastRawTx' >
      <md-table-cell>0</md-table-cell>
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
  watch: {
    lastTxStatus: function(m){
      this.$toast.success(m);
    },
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

</style>
