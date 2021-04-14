const { wifToPubKey, encryptKey, decryptKey, generateKeyPair } = require('../../lib/wallet')
const localWalletEnc = window.localStorage.getItem('walletEnc')
const localWalletDec = window.localStorage.getItem('walletDec')
import { walletService } from '../services'

const { txnTypeEnum } = walletService
/**
  * wallet data is cache in local storage; persists in encrypted form, 
     */
const state = {
  walletEnc: localWalletEnc ? JSON.parse(localWalletEnc) : [],
  walletDec: localWalletDec ? JSON.parse(localWalletDec) : [],
  currentAddressIndex: 0,
  utxoArray: [],
  // currentTxnType: txnTypeEnum.,
  price: 0,
  sats: 0,
  toAddress: "",
  name: "",
  contract: "",
  quantity: 0,
  channelPrice: 0,
  channelBalance: 0,
  // buildRawTxMessage: '',
  // unSignedRawTx: '',
  // signedRawTx:'',
  // amount1: 32,
  // amount2: 32,
  // lastRawTx: '',
  // lastTlTx: '',
  // lastTxStatus: '',
  // selectedToken: 0,
  ltcAvailable: 0,
}

// reusable helpers
const decryptWalletExtracted = (state, password) => {
  const wifKeys = state.walletEnc.map((encryptedKey) => decryptKey(encryptedKey, password))
  if (wifKeys.length === 0) {
    return true
  } else if (wifKeys.includes(false)) {
    return false
  } else {
    const walletDec = wifKeys.map((wifKey) => (
      {
        wifKey,
        publicAddress: wifToPubKey(wifKey)
      }
    ))
    state.walletDec = walletDec;
    window.localStorage.setItem('walletDec', JSON.stringify(walletDec));
    return true
  }

}
const addKeyPairToState = (state, keyPair, password) => {
  const ecriptedWif = encryptKey(keyPair.wifKey, password)
  const walletEnc = [...state.walletEnc];
  const walletDec = [...state.walletDec];

  if (!walletDec.some(e => e.publicAddress === keyPair.publicAddress)) {
    walletEnc.push(ecriptedWif)
    walletDec.push(keyPair);
  }

  state.walletEnc = walletEnc;
  state.walletDec = walletDec;
  window.localStorage.setItem('walletEnc', JSON.stringify(walletEnc))
  window.localStorage.setItem('walletDec', JSON.stringify(walletDec))
  return true
}

const actions = {
  async getAvailableBalance({ commit, state }) {
    const addresses = state.walletDec.map(a => a.publicAddress);
    const balance = await walletService.getAvailableBalance(addresses);
    console.log({balance})
    const totalAvailable = balance.find(b => b.address === "sum").confirmed_balance;
    commit('setLtcAvailable', totalAvailable);
  },
  // async createCustomRawTx({ commit, state }, txBuildOptions){
  //   const buildRawTxResult = await walletService.buildRawTx(txBuildOptions);
  //   const { data, error } = buildRawTxResult;
  //   if (error) commit('setRawTxMessage', `Error: ${error}`)
  //   if (data) {
  //     commit('setRawTxMessage', data);
  //     const decodedRawTx = await walletService.decodeRawTx(data);
  //     const { decodedRawTxData, decodedRawTxError } = decodedRawTx;
  //     if (!decodedRawTxError) {
  //       commit('setUnsignedRawTx', data);
  //     }
  //   }
  //   return buildRawTxResult;
  // },

  // async signRawTx({ commit, state }, unsignedRawTx) {
  //   const signRawTxResult = await walletService.signRawTx(unsignedRawTx);
  //   const { data, error } = signRawTxResult;
  //   if (error) commit('setRawTxMessage', `Error: ${error}`)
  //   if (data) {
  //     if (!data.complete) {
  //       commit('setRawTxMessage', `Error: Undefined Error with signing tx`)
  //     } else {
  //       commit('setRawTxMessage', data.hex)
  //       commit('setSignedRawTx', data.hex)
  //     }
  //   }
  //   return signRawTxResult;
  // },

  // async sendRawTx({commit, state }, signedRawTx) {
  //   const sendRawTxResult = await walletService.sendRawTx(signedRawTx);
  //   const { data, error } = sendRawTxResult;
  //   if (error) commit('setRawTxMessage', `Error: ${JSON.stringify(error)}`);
  //   if (data) commit('setRawTxMessage', data);
  //   return sendRawTxResult;
  // },

  // async createSimpleSendRawTx({commit, dispatch, state }, txBuildOptions) {
  //   const { customTxInput, vOut, toAddress, fromAddress, propertyId, quantity, } = txBuildOptions;
  //   const payload = await walletService.createSimpleSendPayload({propertyId, quantity});
  //   const payLoadData = payload.data;
  //   const payloadError = payload.error;
  //   if (payloadError) return commit('setRawTxMessage', `Error: ${JSON.stringify(payloadError)}`);

  //   if (fromAddress) {
  //     const validateAddress = await walletService.validateAddress(fromAddress);
  //     if (validateAddress.error) return commit('setRawTxMessage', `Error: ${JSON.stringify(validateAddress.error)}`);
  //     if (!validateAddress.data.isvalid) return commit('setRawTxMessage', `Error: Address is not valid`);
  //     if (validateAddress.data.isvalid) {
  //       const result = await walletService.getUTXOs2(fromAddress)
  //       const bestUnspent = result.txs.find(tx => parseFloat(tx.value) > 0.0004);
  //       if (!bestUnspent) return commit('setRawTxMessage', `Error: Not enaugh balance in this address`);
  //       const txBuildOptions = {
  //         customTxInput: bestUnspent.txid,
  //         vOut: bestUnspent.output_no,
  //         toAddress: toAddress,
  //         payload: payLoadData,
  //       }
  //       dispatch('createCustomRawTx', txBuildOptions)
  //     }
  //   } else if (customTxInput && vOut) {
  //     const txBuildOptions = {
  //       customTxInput: customTxInput,
  //       vOut: vOut,
  //       toAddress: toAddress,
  //       payload: payLoadData,
  //     }
  //     dispatch('createCustomRawTx', txBuildOptions)
  //   }
  // },
  
  // todo: call after new address is added
  setCurrentAddress({ commit, state }, index) {
    commit('setCurrentAddressIndex', index)
    // const newAddress = state.walletDec[index].publicAddress;
    // walletService.getUTXOs(newAddress, (utxoArray) => {
    //   commit('setUTXOArray', utxoArray)
    // })
  },
  updateCurrentUTXOs({ dispatch, state }) {
    // run this in a setInterval
    const { walletDec, currentAddressIndex } = state
    if (walletDec[currentAddressIndex]) {
      dispatch('setCurrentAddress', currentAddressIndex)
    }
  },
  decryptWalletAction({ commit, state }, args) {
    const { password, next } = args
    if (decryptWalletExtracted(state, password)) {
      next(true)
    } else {
      next(false)
    }
  }
}
const mutations = {
  // setLastTlTx(state, hex) {
  //   state.lastTlTx = hex
  // },

  // setLastRawTx(state, hex) {
  //   state.lastRawTx = hex
  // },

  // setLastTxStatus(state, status) {
  //   state.lastTxStatus = status
  // },

  // setSignedRawTx(state, tx) {
  //   state.signedRawTx = tx;
  // },

  // setUnsignedRawTx(state, tx) {
  //   state.unSignedRawTx = tx;
  // },

  // setRawTxMessage(state,message) {
  //   state.buildRawTxMessage = message
  // },

  setLtcAvailable(state, amount) {
    state.ltcAvailable = amount
  },

  addKeyPair(state, { password, next, error }) {
    if (decryptWalletExtracted(state, password)) {
      const keyPair = generateKeyPair()
      addKeyPairToState(state, keyPair, password)

      return next && next()
    }
    return error && error()
  },
  addKeyPairFromWif(state, { wifKey, password }) {
    if ((state.walletEnc.length > 0) && !decryptWalletExtracted(state, password)) {
      return false
    }

    // TODO: check if valid wif?

    try {
      const publicAddress = wifToPubKey(wifKey)
      addKeyPairToState(state, { wifKey, publicAddress }, password)
    } catch(err) { alert('Wrong Recovery Key') }
    
  },
  addKeyPairFromEncWifArray(state, { wifKeys, password }) {
    if ((state.walletEnc.length > 0) && !decryptWalletExtracted(state, password)) {
      return false
    }

    const decryptedWallet = wifKeys.map(encWifKey => {
      const wifKey = decryptKey(encWifKey, password);
      if(!wifKey) return false;
      const publicAddress = wifToPubKey(wifKey);
      return { wifKey, publicAddress}
    })
    if(decryptedWallet.some(e => !e)) {
      alert('Wrong Recovery Keys/Json or password')
    } else {
      decryptedWallet.forEach(w => {
        const { wifKey, publicAddress} = w;
        addKeyPairToState(state, { wifKey, publicAddress }, password)
      })
    }
    
  },
  decryptWallet(state, password) {
    return decryptWalletExtracted(state, password)
  },
  clearDecryptedWallet(state) {
    state.walletDec = []
    window.localStorage.setItem('walletDec', JSON.stringify([]))
  },
  setCurrentAddressIndex(state, index) {
    state.currentAddressIndex = index
  },
  setUTXOArray(state, utxoArray) {
    state.utxoArray = utxoArray
  },
  setTxnState(state, { key, value }) {
    state[key] = value
  },
  clearKeys(state) {
    state.walletEnc = [];
    state.walletDec = [];
    window.localStorage.setItem('walletEnc', JSON.stringify([]))
    window.localStorage.setItem('walletDec', JSON.stringify([]))
  },
  setCurrentTxnType(state, value) {
    state.currentTxnType = value
  },
  setIssueOrRedeemCurrency(state, { contract, name, quantity, txnType }) {
    state.contract = contract
    state.name = name
    state.quantity = quantity
    state.currentTxnType = txnType

    window.toggleWallet && window.toggleWallet()

  },
  // setBuyOrSellContract(state, { quantity, price, txnType, contract }) {
  //   state.amount1 = quantity
  //   state.amount2 = price
  //   state.currentTxnType = txnType
  //   state.contract = contract
  //   window.toggleWallet && window.toggleWallet()
  // },
  // setLTCInstantContract(state, { selectedToken, amount, ltcAmount, txnType}) {
  //   state.selectedToken = selectedToken;
  //   state.amount1 = amount;
  //   state.amount2 = ltcAmount;
  //   state.currentTxnType = txnType;
  //   window.toggleWallet && window.toggleWallet()
  // }
}

const getters = {
  // lastTlTx(state) {
  //   return state.lastTlTx
  // },

  // lastRawTx(state) {
  //   return state.lastRawTx
  // },

  // lastTxStatus(state) {
  //   return state.lastTxStatus
  // },

  // amount1(state){
  //   return state.amount1
  // },
  // amount2(state){
  //   return state.amount2
  // },
  // selectedToken(state) {
  //   return state.selectedToken;
  // },
  // getBuildRawTxMessage(state) {
  //   console.log(state.buildRawTxMessage)
  //   return state.buildRawTxMessage;
  // },
  getLtcAvailable(state) {
    return state.ltcAvailable;
  },

  walletCountDisplay(state) {
    const count = state.walletDec.length
    switch (count) {
      case 0:
        return state.walletEnc.length ? `No Addresses (${state.walletEnc.length} locked)` : `No Addresses`
      case 1:
        return "1 Address"
      default:
        return `${count} Addresses`
    }
  },
  hasEncryptedKeys(state) {
    return state.walletEnc.length > 0;
  },
  isLoggedIn(state) {
    return state.walletDec.length > 0;
  },
  addressGetter(state) {
    const addressObj = state.walletDec[state.currentAddressIndex]
    return addressObj ? addressObj.publicAddress : ""
  },
  currentAddressLTCBalance(state) {
    return state.utxoArray.reduce((acc, curr) => { return acc + +curr.satoshis }, 0)
  },
  publicAddresses(state) {
    return state.walletDec.map((obj) => obj.publicAddress)
  },
  walletEnc(state) {
    return state.walletEnc
  }

}

export const wallet = {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
