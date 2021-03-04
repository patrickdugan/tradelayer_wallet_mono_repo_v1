<template>
    <div class="menu-container">
        <div
            class="item"
            :class="{ selected: getSelectedTab === tab.id }"
            v-on:click="selectTab(tab.id)"
            v-for="tab of getTabsList" v-bind:key="tab.id"
        >
            <div class="image" :class='{ allIcon: tab.id === 3 }' >
                <img :src='tab.icon' alt />
            </div>
            <span>{{ tab.name }}</span>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
export default {
    name: 'SubMenu',
    computed: {
    ...mapGetters('contracts2', ['getTabsList', 'getSelectedTab']),
    },
    methods: {
        ...mapMutations('contracts2', ['selectTab']),
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
</style>