const TradeTypes = {
    LTC_INSTANT: 'LTC_INSTANT',
    TOKEN_TOKEN: 'TOKEN_TOKEN',
}

const state = {};

const getters = {};

const actions = { 
    initTrade({ dispatch, commit, rootState }, options) {
        const { amount, price, market, marketType, action } = options;

        switch (marketType) {
            case 'LTC':
                console.log('New LTC Instant Trade !');
            break;
            case 'ALL':
                console.log('New Token Token Trade !');
            break;
            case 'USD':
                console.log('New USD Trade !');
            break;
            default:
                break;
        }

        window.toggleWallet();
    },
};

const mutations = {};

export const trades = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }