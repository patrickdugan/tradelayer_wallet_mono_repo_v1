// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbvue/build/css/mdb.css'
import App from './App'
import { router } from './router'
import Vuex from 'vuex'
import {store} from './store'
import Vuelidate from 'vuelidate'
import VueLodash from 'vue-lodash'
import 'andy-vue-material/dist/andy-vue-material.min.css'
import 'andy-vue-material/dist/theme/default-dark.css'

// import colors from 'vuetify/es5/util/colors'
import { MdApp, MdElevation, MdIcon, MdButton, MdContent, MdTabs, MdCard, MdRadio, MdField, MdTable, MdMenu, MdToolbar, MdTooltip, MdDrawer, MdLayout, MdList, MdCheckbox, MdRipple } from 'andy-vue-material/dist/components'
// import 'vue-material-design-icons/styles.css'
// import Vuetify from 'vuetify'
// import AndyVueMaterial from 'andy-vue-material/dist'
import CircleMenu from 'vue-side-circle-menu'
import Toast, { POSITION } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

Vue.component('CircleMenu', CircleMenu)
const options = { name: 'lodash' } // customize the way you want to call it

Vue.use(VueLodash, options) // options is optional
// import Vuetify from 'vuetify'

// var numeral = require('numeral')
Vue.filter('formatNumber', function (value) {
  value = value / 100000000
  return value // displaying other groupings/separators is possible, look at the docs
})

Vue.filter('formatNumber8Decimals', function (value) {
  value = value / 1
  value = value.toFixed(8)
  return value // displaying other groupings/separators is possible, look at the docs
})

// str.replace(/"/g,"");
Vue.filter('formatNoQuotes', function (value) {
  value = value.replace(/"/g, '')
  return value // displaying other groupings/separators is possible, look at the docs
})

// import MenuIcon from 'vue-material-design-icons/Menu.vue'
// Vue.component('menu-icon', MenuIcon)
Vue.use(Toast, { timeout: 3000, position: POSITION.BOTTOM_RIGHT });
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdRadio)
Vue.use(MdCard)
Vue.use(MdTable)
Vue.use(MdField)
Vue.use(MdMenu)
Vue.use(MdToolbar)
Vue.use(MdDrawer)
Vue.use(MdLayout)
Vue.use(MdApp)
Vue.use(MdElevation)
Vue.use(MdIcon)
Vue.use(MdList)
Vue.use(MdTooltip)
Vue.use(MdCheckbox)
Vue.use(MdRipple)

Vue.use(Vuelidate)

// Vue.use(Vuetify, {
//   theme: {
//     primary: '#1b5b60', // #1b5b60 green
//     secondary: '#8c1d2f', // #8c1d2f red
//     accent: '#ffffff' // #3F51B5
//   }
// })
// Vue.use(window.vuelidate.default)
// Vue.use(Vuetify, {
//   theme: {
//     primary: '#00838F',
//     secondary: '#0097A7',
//     accent: '#006064',
//     error: '#f44336',
//     warning: '#ffeb3b',
//     info: '#2196f3',
//     success: '#4caf50'
//   }
// })
Vue.config.productionTip = false

Vue.use(Vuex)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
