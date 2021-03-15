const io = require("socket.io-client");

const state = {
    rawBtcPrice: [],
};

const actions = {
    feedBtc({dispatch, commit, rootState, rootGetters}) {
        const initMsg = {
            "jsonrpc" : "2.0",
            "id" : 833,
            "method" : "public/get_tradingview_chart_data",
            "params" : {
              "instrument_name" : "BTC-PERPETUAL",
              "start_timestamp" : new Date().getTime() - 86400000 * 7,
              "end_timestamp" : new Date().getTime(),
              "resolution" : "1"
            }
          };
        const ws = new WebSocket('wss://test.deribit.com/ws/api/v2');
        ws.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);
                    let feed = [];
                    if (!data.result.ticks.length) return;
                for (let i = 0; i < data.result.ticks.length; i++) {
                    const time = data.result.ticks[i] / 1000;
                    const open = data.result.open[i];
                    const high = data.result.high[i]
                    const low =  data.result.low[i];
                    const close = data.result.close[i];
                    const payload = { time, open, high, low, close };
                    feed.push(payload);
                }
                commit('addToData', feed);
            } catch(err) {
                console.log(err);
            }
        };
        ws.onopen = () => ws.send(JSON.stringify(initMsg));
        setInterval(() => {
            const msg = {
                "jsonrpc" : "2.0",
                "id" : 833,
                "method" : "public/get_tradingview_chart_data",
                "params" : {
                  "instrument_name" : "BTC-PERPETUAL",
                  "start_timestamp" : new Date().getTime() - 36000,
                  "end_timestamp" : new Date().getTime(),
                  "resolution" : "1"
                }
            };
            ws.send(JSON.stringify(msg))
        }, 10000);
    }
};
 
const mutations = {
    addToData: (state, payload) => {
          state.rawBtcPrice = [...state.rawBtcPrice, ...payload];
    },
};

const getters = {
    getRawBtcPrice: (state) => state.rawBtcPrice,
};

export const prices = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters,
};
  