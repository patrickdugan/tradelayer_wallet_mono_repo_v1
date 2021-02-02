import { socketService } from '../services'
import mainSocket from '../socket/socketconnect'

class Notification {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}

const state = {
    lastRawTxs: [],
    lastTlTxs: [],
    lastTxsStatus: [],
    txNotification: null,
};

const actions = {
    createSocketTrade: async ({ commit, state }, options) => {
        const listener = window.listenersList[0]; // hardcoded listerner localhost
        const myRec = socketService.initNewReceiver(listener, options);
    
        myRec.io.on('readyForSending', (data) => {
            const { hex } = data;
            if (!hex) return;
            const message = 'Waiting for commits to be confirmed';
            commit('setLastRawTxs', hex);
            commit('setLastTlTxs', { finalTx: "Not yet created!", rawTx: hex });
            commit('setLastTxsStatus', { message, rawTx: hex });
            commit('setTxNotification', new Notification('warning', message));

        });

        myRec.io.on('finalTx', (data) => {
            const { finalTx, rawTx } = data;
            const message = 'Waiting for TL Tx to be confirmed!';
            commit('setLastTlTxs', { finalTx, rawTx });
            commit('setLastTxsStatus', { message, rawTx });
            commit('setTxNotification', new Notification('warning', message));

        });

        mainSocket.on('validCommits', (data) => {
            const { listenerCommitIsValid, receiverCommitIsValid, rawTx } = data;
            if (!listenerCommitIsValid && !listenerCommitIsValid) {
                const message = "Both channel commit are not valid!";
                commit('setLastTxsStatus', { rawTx, message });
                commit('setTxNotification', new Notification('error', message));
                return;
            }
            if (!listenerCommitIsValid) {
                const message = "Listener's channel commit is not valid!";
                commit('setLastTxsStatus', { rawTx, message });
                commit('setTxNotification', new Notification('error', message));
                return;
            }
            if (!receiverCommitIsValid) {
                const message = "Your channel commit is not valid!";
                commit('setLastTxsStatus', {rawTx, message});
                commit('setTxNotification', new Notification('error', message));
                return
            }
          });
    
        mainSocket.on('validLastTx', (data) => {
            const { rawTx, result } = data;
            if (!result) {
                commit('setLastTxsStatus', { rawTx, message: 'Invalid!' });
                commit('setTxNotification', new Notification('error', `Invalid Transaction`));
                return;
            }

            commit('setLastTxsStatus', { rawTx, message: 'Valid!' });
            commit('setTxNotification', new Notification('success', 'Valid Transaction!'));
            return;
        });
          
      },
};

const getters = {
    getLastRawTxs: (state) => state.lastRawTxs,
    getLastTlTxs: (state) => state.lastTlTxs,
    getLastTxsStatus: (state) => state.lastTxsStatus,
    getTxNotification: (state) => state.txNotification,

};

const mutations = {
    setLastRawTxs: (state, hex) => state.lastRawTxs = [...state.lastRawTxs, hex],
    setLastTlTxs: (state, payload) => {
        console.log('Tl');
        console.log({payload})
        const { finalTx, rawTx } = payload;
        const index = state.lastRawTxs.findIndex(tx => tx === rawTx);
        console.log('index', index)
        state.lastTlTxs = [...state.lastTlTxs];
        state.lastTlTxs[index] = finalTx;
    },
    setLastTxsStatus: (state, payload) => {
        console.log('status');
        console.log({payload})
        const { message, rawTx } = payload;
        const index = state.lastRawTxs.findIndex(tx => tx === rawTx);
        console.log('index', index)
        state.lastTxsStatus = [...state.lastTxsStatus];
        state.lastTxsStatus[index] = message;
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

