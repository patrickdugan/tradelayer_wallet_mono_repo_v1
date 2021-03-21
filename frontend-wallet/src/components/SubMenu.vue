<template>
    <div class="sub-menu-container">
        <div class="menu-container">
            <div
                class="item"
                :class="{ selected: selectedMarketTypeId === tab.id }"
                v-on:click="selectedMarketType(tab.id)"
                v-for="tab of getMarketsTypes" v-bind:key="tab.id"
            >
                <div class="image" :class='{ allIcon: tab.id === 3 }' >
                    <img :src='tab.icon' alt />
                </div>
                <span>{{ tab.name }}</span>
            </div>
        </div>
        <div class="markets-menu">
            <div 
                class="market"
                v-bind:class="{ 'active-market': getSelectedMarketId === market.id }"
                v-for="market of getMarkets" 
                v-bind:key='market.id'
                v-on:click='selectMarket(market.id)'
            >
                {{ market.pair }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
export default {
    name: 'SubMenu',
    computed: {
    ...mapGetters('markets', ['getMarketsTypes', 'selectedMarketTypeId', 'getMarkets', 'getSelectedMarketId']),
    },
    methods: {
        ...mapMutations('markets', ['selectedMarketType', 'selectMarket']),
    }
}
</script>

<style>
    .menu-container {
        margin-top: 0.75rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .menu-container .item {
        padding: 0.5rem 0.75rem;
        margin: 0 0.5rem;
        color: wheat;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: background 0.3s;
    }
    .menu-container .item:hover {
        background: gray;
    }
    .menu-container .item .image {
        width: 1.5rem;
        height: 1.5rem;
        margin-right: 0.5rem;
        overflow: hidden;
    }
    .selected {
        border-top: 3px solid rgb(56, 103, 255);
    }
    .allIcon {
        background-color: rgb(41, 126, 183);
        border-radius: 50%;
    }
    .allIcon img {
        transform: scale(1.6);
    }
    .markets-menu {
        color: gainsboro;
        display: flex;
        align-items: center;
        background: rgb(37, 37, 37);
        border: 1px solid rgb(32, 32, 32);
        box-shadow: 0 0 0.5rem 0rem rgb(31, 31, 31);
        margin: 1rem 0;
        padding: 0.15rem;
    }

    .markets-menu .market {
        margin: 0.25rem 2.5rem;
        cursor: pointer;
    }

    .active-market {
        color: rgb(197, 236, 54);
    }

</style>