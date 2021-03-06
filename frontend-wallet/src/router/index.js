import Vue from 'vue'
import Router from 'vue-router'
import CreateWalletContainer from '@/containers/CreateWalletContainer'
import LoginContainer from '@/containers/LoginContainer'
import SummaryContainer from '@/containers/SummaryContainer'
// import BalancesContainer from '@/containers/BalancesContainer'
import OrdersContainer from '@/containers/OrdersContainer'
import PositionsContainer from '@/containers/PositionsContainer'
import ChartsContainer from '@/containers/ChartsContainer'
import PortfolioContainer from '@/containers/PortfolioContainer'
import OrderbookContainer from '@/containers/OrderbookContainer'
import HistoricalTradesContainer from '@/containers/HistoricalTradesContainer'
import OrderbookBuy from '@/components/OrderbookBuy'
import OrderbookSell from '@/components/OrderbookSell'
import TaxesContainer from '@/containers/TaxesContainer'
import HistoricalTradesbyAddressContainer from '@/containers/HistoricalTradesbyAddressContainer'
import Recover from '@/components/Recover'
import WhitelistsContainer from '@/containers/WhitelistsContainer'
import TradeChannelManager from '@/containers/TradeChannelManager'
import TranasctionsLogContainer from '@/containers/TransactionsLogContainer'
import ProfileContainer from "@/containers/ProfileContainer"
import { store } from '../store'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/Taxes',
      name: 'Taxes',
      component: TaxesContainer
    },
    {
      path: '/OrderbookBuy',
      name: 'OrderbookBuy',
      component: OrderbookBuy
    },
    {
      path: '/Charts',
      name: 'Charts',
      component: ChartsContainer
    },
    {
      path: '/OrderbookSell',
      name: 'OrderbookSell',
      component: OrderbookSell
    },
    {
      path: '/Summary',
      name: 'Summary',
      component: SummaryContainer
    },
    {
      path: '/CreateWallet',
      name: 'CreateWallet',
      component: CreateWalletContainer
    },
    {
      path: '/',
      name: 'LoginContainer',
      component: LoginContainer
    },
    {
      path: '/Balances',
      name: 'Balances',
      component: PortfolioContainer
    },
    {
      path: '/Positions',
      name: 'Positions',
      component: PositionsContainer
    },
    {
      path: '/Orders',
      name: 'Orders',
      component: OrdersContainer
    },
    {
      path: '/Portfolio',
      name: 'Portfolio',
      component: PortfolioContainer
    },
    {
      path: '/Orderbook',
      name: 'Orderbook',
      component: OrderbookContainer
    },
    {
      path: '/HistoricalTrades',
      name: 'Historical Trades',
      component: HistoricalTradesContainer
    }, {
      path: '/Recover',
      name: 'Recover',
      component: Recover
    },
    {
      path: '/HistoricalTradesbyAddress',
      name: 'Historical Trades by Address',
      component: HistoricalTradesbyAddressContainer
    },
    {
      path: '/TransactionsLog',
      name: 'Transactions Log',
      component: TranasctionsLogContainer
    },
    {
      path: '/WhiteLists',
      name: 'Whitelists',
      component: WhitelistsContainer
    },
    {
      path: '/TradeChannelManager',
      name: 'Trade Channel Manager',
      component: TradeChannelManager
    },
    {
      path: '/Profile',
      name: 'Profile',
      component: ProfileContainer
    },
    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ],
  mode: 'history'

})

router.beforeEach((to, from, next) => {

  const { walletEnc, walletDec } = store.state.wallet
  const walletEncPresent = walletEnc.length > 0;
  const walletDecPresent = walletDec.length > 0;
  // root to summary if logged in
  if (to.path == '/' && walletDecPresent) {
    return next('/Summary')
  }
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/', '/CreateWallet', '/Recover']
  // console.log('to path', to.path)
  if (publicPages.includes(to.path)) {
    return next()
  }
  console.log(from)
  if (!walletDecPresent) {
    return next('/')
  }


  next()
})
