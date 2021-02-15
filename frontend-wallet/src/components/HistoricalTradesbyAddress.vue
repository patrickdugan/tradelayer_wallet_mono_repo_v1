<template >
  <md-table style='text-align: left'>
        <md-table-row>
          <md-table-head style='width: 1rem'>#</md-table-head>
          <md-table-head>Raw TX</md-table-head>
          <md-table-head>TradeLayer TX</md-table-head>
          <md-table-head>Status</md-table-head>
        </md-table-row>
    <md-table-row v-for="(tx, i) in getLast10Tx" :key='tx.rawTx'>
      <md-table-cell  md-tooltip='asd'> {{ i }} </md-table-cell>
      <md-table-cell>
        {{ tx.rawTx ? `${tx.rawTx.slice(0,24)}...${tx.rawTx.slice(-24)}` : '' }}
        <md-tooltip style='width: 300px; height: auto; white-space: initial; word-wrap: break-word;'>{{ tx.rawTx }}</md-tooltip>
      </md-table-cell>
      <md-table-cell>{{ tx.tlTx }}</md-table-cell>
      <md-table-cell>{{ tx.message }}</md-table-cell>
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
    ...mapGetters('wallet', ['addressGetter',]),
    ...mapGetters('channelsTrade', ["getLast10Tx", "getTxNotification"]),
  },
  mounted () {
    this.handleTrades()
  },
  watch: {
    getTxNotification: function(n){
      this.$toast[n.status](n.message);
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
