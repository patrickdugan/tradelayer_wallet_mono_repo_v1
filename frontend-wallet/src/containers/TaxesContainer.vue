<template>
  <div id="ChartsContainer">
    <div class="md-layout md-gutter md-alignment-center-space-between">
      <div class="md-layout-item md-small-hide">
        <md-tabs md-sync-route>
          <md-tab id="tab-summary" md-label="Trading" to="/Summary"></md-tab>
          <md-tab id="tab-portfolios" md-label="Portfolio" to="/Portfolio"></md-tab>
          <md-tab id="tab-charts" md-label="Charts" to="/Charts"></md-tab>
          <md-tab id="tab-taxes" md-label="Taxes" to="/Taxes"></md-tab>
        </md-tabs>
      </div>
    </div>
    <Taxes />
  </div>
</template>

<script>
import Taxes from "@/components/Taxes";

export default {
  name: "TaxesContainer",
  components: { Taxes }
};
</script>

<style>
</style>
