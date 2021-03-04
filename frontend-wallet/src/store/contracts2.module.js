const tabsList = [
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
        icon: 'https://cdn.discordapp.com/attachments/749975407838888058/817037799739490344/ALLFancyLogo.png'
    },
];

const state = {
    tabsList: tabsList,
    selectedTab: 1,
};

const getters = {
    getTabsList: (state) => state.tabsList,
    getSelectedTab: (state) => state.selectedTab,
};

const actions = {

};

const mutations = {
    selectTab(state, id) {
        state.selectedTab = id;
    },
};

export const contracts2 = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }