<template>
  <div id="app" class="page-container md-layout-column">
    <Toolbar @toggleNavigation='showNavigation = !showNavigation' />
    <md-tabs md-sync-route class='main-tabs'>
          <md-tab id="tab-summary" md-label="Trading" to="/Summary"></md-tab>
          <md-tab id="tab-portfolios" md-label="Portfolio" to="/Portfolio" md-disabled></md-tab>
          <md-tab id="tab-charts" md-label="Charts" to="/Charts" md-disabled></md-tab>
          <md-tab id="tab-taxes" md-label="Taxes" to="/Taxes" md-disabled></md-tab>
        </md-tabs>
    <SubMenu />
    <md-drawer id="wallet-container" class="md-left" :md-active.sync="showWallet">
      <Wallet />
    </md-drawer>
    <md-drawer class="md-left" :md-active.sync="showNavigation">
      <Navigation @close-navigation='showNavigation = false;' />
    </md-drawer>
    <router-view />
  </div>
</template>

<script>

import Toolbar from "@/components/Toolbar"
import Wallet from "@/components/Wallet";
import Navigation from "@/components/Navigation"
import SubMenu from '@/components/SubMenu';
import { mapGetters, mapMutations, mapState, mapActions } from "vuex";

export default {
  name: "App",
  components: {
    Wallet,
    Navigation,
    Toolbar,
    SubMenu,
  },
  data: () => ({
    showNavigation: false,
    showWallet: false
  }),
  computed: {
    ...mapGetters('alert', ['getAlert']),
  },
  mounted() {
    window.toggleWallet = this.toggleWallet;
    this.availableBalanceAction();
  },
    watch: {
    getAlert: function(n){
      console.log({n})
      if (!n.type) return;
      this.$toast[n.type](n.message);
      this.clear()
    },
  },
  methods: {
        ...mapMutations('alert', ['clear']),
        ...mapActions('wallet', ['availableBalanceAction']),
    toggleWallet() {
      this.showWallet = !this.showWallet;
    },

  }
};
</script>

<style>

.md-table {
  box-shadow: 0 0 0.25rem black;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top:15px;
  min-height: 100vh;
}

.md-primary {
  color: #000000;
}

.md-button {
  border: 1px;
  border-radius: 3%/6%;
}

.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
  border: 1px;
  border-radius: 3%/6%;
}

.md-toolbar {
  border: 1px;
  border-radius: 3%/6%;
  background-color: #367588 !important
}

.md-table {
  margin: 10px 10px;
}

.md-table-head {
  border: 1px;
  border-radius: 3%/6%;
}

.md-table-row {
  border: 1px;
  border-radius: 3%/6%;
}

.md-table-cell {
  border: 1px;
  border-radius: 3%/6%;
}

.md-card {
  margin: 10px 10px;
  border: 1px;
}

.md-card-content {
  border: 1px;
  border-radius: 3%/6%;
}

.page-container {
  position: relative;
  border: 20px solid rgba(#000, 0.12);
}

#wallet-container {
  width: 350px;
}
</style>

<style lang="sass">
// @import ~vue-material/dist/theme/engine
// +md-register-theme("default", (primary: md-get-palette-color(purple, 900), accent: md-get-palette-color(purple, 200), theme: light))
// //+md-register-theme("default", (primary: md-get-palette-color(green, A200), accent: md-get-palette-color(purple, 200), theme: dark))
// // +md-register-theme("default", (primary:#3fffbe, accent: #3fffbe, theme: dark))
// @import ~vue-material/dist/theme/all
// @import ~vue-material/dist/components/MdButton/theme
//
// // Apply the Button theme
// @import ~vue-material/dist/components/MdContent/theme
//
// // Apply the Content theme
// @import ~vue-material/dist/components/MdToolbar/theme

// Apply the Toolbar theme
// @import "~vue-material/dist/theme/engine";
//
// @include md-register-theme("default", (
//   primary: md-get-palette-color(purple, 900), // The primary color of your application
//    accent: md-get-palette-color(purple, 200), // The accent or secondary color
//    theme: dark
//  ));
//
// @import "~vue-material/dist/theme/all";
// @import "~vue-material/dist/components/MdButton/theme"; // Apply the Button theme
// @import "~vue-material/dist/components/MdContent/theme"; // Apply the Content theme
// @import "~vue-material/dist/components/MdToolbar/theme"; // Apply the Toolbar theme

</style>
