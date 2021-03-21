class Token {
    constructor(id, name, fullname) {
        this.id = id;
        this.name = name;
        this.fullname = fullname;
    }
};

class Market {
    constructor(id, a, b) {
        this.id = id;
        this.a = a;
        this.b = b
    }

    get pair() {
        return `${this.a.name}/${this.b.name}`
    }
    get reversed() {
        return `${this.b.name}/${this.a.name}`
    }
};

const _WDN = new Token(4, 'WDN', 'Wooden Token');
const _GLD = new Token(5, 'GLD', 'Gold Token');
const _LTC = new Token(1, 'LTC', 'Litecoin');
const _USD = new Token(9, 'USD', 'US Dollar');

const marketTypes = [
    {
        id: 1,
        name: 'LTC',
        icon: 'https://bitcoin-capital.bg/wp-content/uploads/2019/07/1920px-LTC-400-min-300x300.png',
        markets: [
            new Market(1, _WDN, _LTC),
            new Market(2, _GLD, _LTC),
        ],
    },
    {
        id: 2,
        name: 'USD',
        icon: 'https://cdn0.iconfinder.com/data/icons/mobile-device/512/dollar-usd-round-keyboard-money-usa-latin-2-512.png',
        markets: [
            new Market(1, _WDN, _USD),
            new Market(2, _GLD, _USD),
        ],
    },
    {
        id: 3,
        name: 'ALL',
        icon: 'https://cdn.discordapp.com/attachments/749975407838888058/817037799739490344/ALLFancyLogo.png',
        markets: [
            new Market(1, _WDN, _GLD),
            new Market(2, _GLD, _WDN),
        ],
    },
];

const state = {
    marketTypes: marketTypes,
    selectedMarketTypeId: 1,
    selectedMarketId: 1,
};

const getters = {
    getMarketsTypes: (state) => state.marketTypes,
    selectedMarketTypeId: (state) => state.selectedMarketTypeId,
    selectedMarketTypeName: (state) => state.marketTypes.find(m => m.id === state.selectedMarketTypeId).name,
    getMarkets: (state) => state.marketTypes.find(m => m.id === state.selectedMarketTypeId).markets,
    getSelectedMarketId: (state) => state.selectedMarketId,
    getSelectedMarket: (state) => {
        return state.marketTypes
            .find(m => m.id === state.selectedMarketTypeId)
            .markets
            .find(m => m.id === state.selectedMarketId);
    }
};

const actions = { };

const mutations = {
    selectedMarketType(state, id) {
        state.selectedMarketTypeId = id;
        state.selectedMarketId = 1;
    },
    selectMarket(state, id) {
        state.selectedMarketId = id;
    },
};

export const markets = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }