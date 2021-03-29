import { socketService } from '../services'
import socket from '../socket/socketconnect'

export class Notification {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}

const state = {
    txs: [],
    txNotification: null,
};

const actions = {
    createSocketTrade: async ({ commit, state }, options) => {
        const listener = window.listenersList[0]; // hardcoded listerner localhost
        const receiver = socketService.initNewReceiver(listener, options);
        receiver.resultPromise.then(resultObj => {
            console.log({resultObj})
            socket.emit('CHECK_COMMITS', resultObj);
            const message = 'Waiting for commits to be confirmed';
            const rawTx = resultObj.signedRawTx
            commit('pushNewTx', { rawTx: resultObj.signedRawTx })
            commit('setTxStatus', { message, rawTx });
            commit('setTxNotification', new Notification('warning', message));
        });
      },
};

const getters = {
    getLastTx: (state) => state.txs[0],
    getLast10Tx: (state) => state.txs.slice(0, 10),
    getAlltx: (state) => state.txs,
    getTxNotification: (state) => state.txNotification,
};

const mutations = {
    pushNewTx: (state, payload) => {
        const txObj = {
            rawTx: payload.rawTx,
            // tlTx: 'Not yet created...',
            tlTx: payload.tlTx,
            message: 'Pending'
        };
          state.txs = [txObj, ...state.txs]
    },
    setTlTx: (state, payload) => {
        const { tlTx, rawTx } = payload;
        const index = state.txs.findIndex(tx => tx.rawTx === rawTx);
        state.txs[index].tlTx = tlTx;
        state.txs = [...state.txs];
    },
    setTxStatus: (state, payload) => {
        const { message, rawTx } = payload;
        const index = state.txs.findIndex(tx => tx.rawTx === rawTx);
        state.txs[index].message = message;
        state.txs = [...state.txs];
    },
    setTxNotification: (state, notification) => state.txNotification = notification,
};

export const channelsTrade = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations,
  }

