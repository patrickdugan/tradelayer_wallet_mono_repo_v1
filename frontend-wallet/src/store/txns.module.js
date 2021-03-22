import { txnService } from '../services/txn.service';
export const txnType = {
    LTC_INSTANT: 'LTC_INSTANT',
    TOKEN_TOKEN: 'TOKEN_TOKEN',
    USD_TRADE: 'USD_TRADE'
}

const state = {
    selectedTxnType: txnType.TOKEN_TOKEN,
    tokenForSale: null,
    amountForSale: null,
    tokenDesired: null,
    amountDesired: null,
};

const getters = {
    getSelectedTxnType: (state) => state.selectedTxnType,
    getTokenForSale: (state) => state.tokenForSale,
    getTokenDesired: (state) => state.tokenDesired,
    getAmountForSale: (state) => state.amountForSale,
    getAmountDesired: (state) => state.amountDesired,
};

const actions = {
    async buildRawTx({ dispatch, commit, rootState }, options) {
        const { amountDesired, amountForSale, tokenDesired, tokenForSale, type, address } = options;
        if (!address || !type) return;
        if (type === txnType.LTC_INSTANT) {
            const result = await txnService.ltcInstantTrade({
                amountDesired,
                tokenDesired,
                price: amountForSale,
                address,
            })
            console.log(result);
        }

        if (type === txnType.TOKEN_TOKEN) {
            const result = await txnService.tokenTokenTrade({
                amountDesired,
                tokenDesired,
                amountForSale,
                tokenForSale,
                address,
            });
            console.log(result);
        }
    },
    initTrade({ dispatch, commit, rootState }, options) {
        const { amount, price, market, marketType, action } = options;

        switch (marketType) {
            case 'LTC':
                commit('setSelectedTxnType', txnType.LTC_INSTANT);
            break;
            case 'ALL':
                commit('setSelectedTxnType', txnType.TOKEN_TOKEN);
            break;
            case 'USD':
                commit('setSelectedTxnType', txnType.USD_TRADE);
            break;
            default:
                break;
        }

        const txnOption = {};
        if (action === "BUY") {
            txnOption.tokenForSale = market.b;
            txnOption.tokenDesired = market.a;
            txnOption.amountForSale = price;
            txnOption.amountDesired = amount;
        }

        if (action === "SELL") {
            txnOption.tokenForSale = market.a;
            txnOption.tokenDesired = market.b;
            txnOption.amountForSale = amount;
            txnOption.amountDesired = price;
        }
        commit('setTxnOptions', txnOption);

        window.toggleWallet();
    },
};

const mutations = {
    setSelectedTxnType(state, type) {
        state.selectedTxnType = type;
    },
    setTxnOptions(state, options) {
        const { tokenForSale, tokenDesired, amountForSale, amountDesired } = options;
        state.tokenForSale = tokenForSale;
        state.tokenDesired = tokenDesired;
        state.amountForSale = amountForSale;
        state.amountDesired = amountDesired;
    },
};

export const txns = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}