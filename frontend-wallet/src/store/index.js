import Vue from 'vue'
import Vuex from 'vuex'

import { alert } from './alert.module'
import { auth } from './auth.module'
import { orderbook } from './orderbook.module'
import { contracts } from './contracts.module'
import { pcurrency } from './pcurrency.module'
import { loading } from './loading.module'
import { wallet } from './wallet.module'
import { channelsTrade } from './channelsTrade.module'
Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    alert,
    auth,
    orderbook,
    contracts,
    pcurrency,
    loading,
    wallet,
    channelsTrade,
  }
})
