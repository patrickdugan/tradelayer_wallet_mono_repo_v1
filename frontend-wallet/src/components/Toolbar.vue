<template>
    <md-toolbar class="md-theme-default md-primary">
      <div class="md-layout md-gutter md-alignment-center-space-around">
        <md-button class="md-icon-button" @click="toggleNavigation()">
          <md-icon>menu</md-icon>
        </md-button>
        <md-button v-show="isLoggedIn" class="md-icon-button" @click="toggleWallet()">
          <md-icon>money</md-icon>
          <md-tooltip md-direction="bottom">Wallet</md-tooltip>
        </md-button>
        <div class="md-layout-item" >
          <router-link to="https://layerexplorer.com" class="md-avatar" style='background:white;' target='_blank'>
            <img src="@/assets/logo3.png" alt />
          </router-link>
        </div>
        <div class="md-layout-item">
          <router-link to="/Summary">
            <md-icon class="md-left">home</md-icon>
            <md-tooltip md-direction="bottom">Home</md-tooltip>
          </router-link>
        </div>
        <div v-show="isLoggedIn" class="md-layout-item">
          <router-link to="/Profile">
            <md-icon class="md-left">account_circle</md-icon>
            <md-tooltip md-direction="bottom">Profile</md-tooltip>
          </router-link>
        </div>
        <div v-show="isLoggedIn" class="md-layout-item">
          <div @click="logout">
            <md-icon class="md-left">exit_to_app</md-icon>
            <md-tooltip md-direction="bottom">Logout</md-tooltip>
          </div>
        </div>
        <div v-show="isLoggedIn" class="md-layout-item">
          <div @click="downloadEnc">
            <md-icon class="md-left">get_app</md-icon>
            <md-tooltip md-direction="bottom">Download txs</md-tooltip>
          </div>
        </div>
        <label>{{this.walletCountDisplay}}</label>
      </div>

      <div class="md-toolbar-section-end" style='margin: 0 1rem'>
        <div class="md-layout md-gutter md-alignment-center-space-between">
          <div class="md-layout-item" v-show="isLoggedIn">
            <div class="md-list-item-text">
              <span>Equity</span>
              <span>{{this.equityGetter}}</span>
              <md-tooltip md-direction="bottom">Balance + Reserved + PNL</md-tooltip>
            </div>
          </div>
          <div class="md-layout-item" v-show="isLoggedIn">
            <div class="md-list-item-text">
              <span>Available</span>
              <span>{{this.equityGetter}}</span>
              <md-tooltip md-direction="bottom">Equity - Initial Margin</md-tooltip>
            </div>
          </div>
          <div v-show="!isLoggedIn" class="md-layout-item">
            <router-link to="/Recover">
              <md-tooltip md-direction="bottom">Login</md-tooltip>
              <md-icon class="md-left">fingerprint</md-icon>
            </router-link>
          </div>
          <div class="md-layout-item">
            <router-link to="/CreateWallet">
              <md-tooltip md-direction="bottom">Create New Wallet</md-tooltip>
              <md-icon class="md-left">person_add</md-icon>
            </router-link>
          </div>
          <div class="md-layout-item">
            <circle-menu type="bottom" :number="4" animate="animated" mask="white" circle>
              <button type="button" slot="item_btn"></button>
              <router-link to="/Balances" slot="item_1">
                <md-tooltip md-direction="left">Wallet</md-tooltip>
                <md-icon class>account_balance_wallet</md-icon>
              </router-link>
              <router-link to="/Taxes" slot="item_2">
                <md-tooltip md-direction="left">Taxes</md-tooltip>
                <md-icon class>compare_arrows</md-icon>
              </router-link>
              <router-link to="/dCurrency" slot="item_3">
                <md-tooltip md-direction="left">dCurrency</md-tooltip>
                <md-icon class>euro_symbol</md-icon>
              </router-link>
              <router-link to="/Validators" slot="item_4">
                <md-tooltip md-direction="left">Validators</md-tooltip>
                <md-icon class>spellcheck</md-icon>
              </router-link>
            </circle-menu>
          </div>
        </div>
      </div>
    </md-toolbar>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex";
import { txsJsonLink } from '../../lib/wallet'

export default {
    name: "Toolbar",
    components: {},
    data: () => ({
        showWallet: false
    }),
    props: ["showNavigation"],
    computed: {
        ...mapGetters("wallet", [
        "walletCountDisplay",
        "isLoggedIn",
        "publicAddresses",
        "walletEnc"
        ]),
        ...mapGetters("contracts", ["equityGetter"])
    },
    methods: {
        ...mapMutations("wallet", ["clearDecryptedWallet", "clearKeys"]),
        logout() {
          alert('Downloading the wallet before logout ...')
          this.downloadEnc();
          this.clearKeys();
          this.$router.push("/");
        },
        downloadEnc() {
          txsJsonLink(this.walletEnc).click()
        },
        toggleWallet(formData) {
          window.toggleWallet()
        },
        toggleNavigation() {
          this.$emit('toggleNavigation', true);
        }
    }
}
</script>

<style>

</style>