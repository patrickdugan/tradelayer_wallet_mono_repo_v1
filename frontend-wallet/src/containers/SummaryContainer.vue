<template>
  <div id="SummaryContainer">
        <md-tabs md-sync-route class='main-tabs'>
          <md-tab id="tab-summary" md-label="Trading" to="/Summary"></md-tab>
          <md-tab id="tab-portfolios" md-label="Portfolio" to="/Portfolio" md-disabled></md-tab>
          <md-tab id="tab-charts" md-label="Charts" to="/Charts" md-disabled></md-tab>
          <md-tab id="tab-taxes" md-label="Taxes" to="/Taxes" md-disabled></md-tab>
        </md-tabs>
    <SubMenu />
    <MainChart />
    <div class="md-layout md-alignment-top-center">
      <div class="md-xsmall-hide md-small-hide md-layout-item md-small-size-100 md-medium-size-25 md-large-size-25">
        <md-table md-card>
          <md-card-header 
          style="height: 40px;" 
          class="md-alignment-top-center">OrderBook</md-card-header>
          <md-table-row>
            <md-tabs style="height: 250px;">
              <md-tab id="tab-orderbooksell" md-label="Sell">
                <OrderbookSell />
              </md-tab>
            </md-tabs>
          </md-table-row>
          <md-table-row>
            <md-tabs style="height: 250px;">
              <md-tab id="tab-orderbookbuy" md-label="Buy">
                <OrderbookBuy />
              </md-tab>
            </md-tabs>
          </md-table-row>
        </md-table>
      </div>
      <div class="md-small-size-100 md-medium-size-66 md-large-size-50">
        <md-table md-card>
          <md-table-row>
            <BuySell />
          </md-table-row>
        </md-table>
        <md-table style="height: 160px" md-card>
          <md-card-header class="md-layout-item">Inverse contract</md-card-header>

          <md-table-row>
            <md-table-cell style="text-align: right;">Symbol</md-table-cell>
            <md-table-cell style="text-align: left;">ALL/dUSD</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell style="text-align: right;">Type</md-table-cell>
            <md-table-cell style="text-align: left;">Inverse contract</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell style="text-align: right;">Max Leverage</md-table-cell>
            <md-table-cell style="text-align: left;">1x</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell style="text-align: right;">Mark Price</md-table-cell>
            <md-table-cell style="text-align: left;">---</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell style="text-align: right;">Premium</md-table-cell>
            <md-table-cell style="text-align: left;">---%</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell style="text-align: right;">Open Interest</md-table-cell>
            <md-table-cell style="text-align: left;">---</md-table-cell>
          </md-table-row>
        </md-table>
      </div>
      <div
        class="hide-on-desktop md-layout-item md-small-size-100 md-medium-size-25 md-large-size-25"
      >
        <md-table md-card>
          <md-tabs>
            <md-tab id="tab-orderbookbuy" style="height: 250px" md-label="Buy">
              <OrderbookBuy />
            </md-tab>
            <md-tab id="tab-orderbooksell" style="height: 250px" md-label="Sell">
              <OrderbookSell />
            </md-tab>
          </md-tabs>
        </md-table>
      </div>
      <div
        style="height: 600px"
        class="md-layout-item md-small-size-100 md-medium-size-100 md-large-size-33"
      >
        <HistoricalTrades />
        <TradeChannels />
      </div>
    </div>

    <div>
      <md-table>
        <md-tabs class="tabs-tight">
          <md-tab
            style="margin: 0px 0px -20px;"
            id="tab-content-positions"
            class
            md-label="Positions"
          >
            <Positions />
          </md-tab>
          <md-tab id="tab-content-active-pos" class md-label="Active">
            <Active />
          </md-tab>
          <md-tab id="tab-content-fills" class="tab-tight md-label-tight" md-label="Fills">
            <HistoricalTradesbyAddress />
          </md-tab>
          <md-tab id="tab-content-pending" class="tab-tight md-label-tight" md-label="Pending">
            <Pending />
          </md-tab>
          <md-tab id="tab-content-contractBalances" class="tab-tight md-label-tight" md-label="Balances">
            <ContractBalances />
          </md-tab>
        </md-tabs>
      </md-table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BuySell from "@/components/BuySell";
import OrderbookBuy from "@/components/OrderbookBuy";
import OrderbookSell from "@/components/OrderbookSell";
import HistoricalTrades from "@/components/HistoricalTrades";
import HistoricalTradesbyAddress from "@/components/HistoricalTradesbyAddress";
import Positions from "@/components/Positions";
import Close from "@/components/Close";
import Active from "@/components/Active";
import Pending from "@/components/Pending";
import TradeChannels from "@/components/TradeChannels";
import ContractBalances from "@/components/ContractBalances";
import SubMenu from '@/components/SubMenu';
import MainChart from '@/components/MainChart';
// import Balances from '@/components/Balances'

export default {
  name: "SummaryContainer",
  data() {
    return {
      selectedContract: {},
      selectedContractNew: "",
      contractsList: [
        {
          id:   1,
          propsNameForSale: 'Wood',
          propsNameDesired: 'Gold',
          propsIdForSale: 4,
          propsIdDesired: 5,
          type: "pairContract",
        },
        {
          id:   2,
          propsNameForSale: 'LTC',
          propsNameDesired: 'XYZ',
          type: "LTC_instant",
        },
      ]
    };
  },
  computed: {
    ...mapGetters("contracts", ["selectedContractGetter"])
  },
   watch: {
    selectedContractGetter: {
      immediate: true,
      handler() {
        this.handleOrderBook()
      }
    }
  },
  methods: {
    ...mapActions("contracts", ["setSelectedContract"]),
    ...mapActions("orderbook", ["getPairOrderBook", "selectOrder"]),
    handleSelectedContract(value) {
      const pair = this.contractsList.find(e => e.id === value)
      console.log(`Selecting contract with ID: ${pair.id}, Name: ${pair.name}`);
      this.setSelectedContract({selectedContract: pair});
      this.selectOrder({})
    },
    handleOrderBook() {
        if (this.selectedContractGetter.type === "pairContract") {
          this.getPairOrderBook(this.selectedContract)
        }
    },
  },
  components: {
    BuySell,
    OrderbookBuy,
    OrderbookSell,
    HistoricalTrades,
    Positions,
    Close,
    Active,
    Pending,
    HistoricalTradesbyAddress,
    TradeChannels,
    ContractBalances,
    SubMenu,
    MainChart,
  }
};
</script>

<style scoped>
.contracts-list {
  margin: 1.5rem 0 1rem 0;
  background-color: rgb(70, 70, 70);
  box-shadow: 0 0 0.25rem black;
  display: flex;
  justify-content: center;
}

.md-table-toolbar {
  padding: 0px 0px 0px 00px;
  margin: -40px 0px -20px 0px;
  text-align: center;
  font-size: 16px;
}

.tabs-tight {
  margin: 0px 16px 10px;
  padding: 6px 10px 10px;
}

.md-card-header {
  color: #d61d67;
  margin: 0px 0px 0px;
}

.md-table-cell {
  width: 40px;
  height: 6px;
  margin: 0px;
  padding: 0px;
}

.md-field {
  width: 180px;
  margin: 0px 0px 0px 20px;
}

.main-tabs {
  background-color: rgb(65, 65, 65);
  padding-top: 1rem;
  margin-top: -1rem;
  box-shadow: 0 0 0.5rem black
}

@media only screen and (min-width: 960px) {
  .hide-on-desktop {
    display: none;
  }
}
</style>
