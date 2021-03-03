<template>
    <div class="menu-container">
        <div
            class="item"
            :class="{ selected: selectedTab === tab.id }"
            v-on:click="selectedTab = tab.id"
            v-for="tab of tabsList" v-bind:key="tab.id"
        >
            <img :src='tab.icon' />
            <span>{{ tab.name }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SubMenu',
    data () {
        return {
            selectedTab: 1,
            tabsList: [
                {
                    id: 1,
                    name: 'LTC',
                    icon: 'https://bitcoin-capital.bg/wp-content/uploads/2019/07/1920px-LTC-400-min-300x300.png'
                },
                {
                    id: 2,
                    name: 'USD',
                    icon: 'https://cdn0.iconfinder.com/data/icons/mobile-device/512/dollar-usd-round-keyboard-money-usa-latin-2-512.png'
                },
                {
                    id: 3,
                    name: 'ALL',
                    icon: 'https://image.flaticon.com/icons/png/512/566/566295.png'
                },
            ],
        }
    },
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
    .menu-container .item img {
        width: 1.5rem;
        height: 1.5rem;
        margin-right: 0.5rem;
    }
    .selected {
        border-top: 3px solid rgb(56, 103, 255);
    }

</style>