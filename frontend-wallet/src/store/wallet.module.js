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
  currentTxnType: txnTypeEnum.SIMPLE_SEND,
  price: 0,
  sats: 0,
  toAddress: "",
  name: "",
  contract: "",
  quantity: 0,
  channelPrice: 0,
  channelBalance: 0,
  buildRawTxMessage: '',
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
  async buildRawTx({ commit, state }, buildOptions) {
    const tx = await walletService.buildRawTx(buildOptions)
    return tx.message
  },
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
  setRawTxMessage(state,message) {
    state.buildRawTxMessage = message
  },
  // creates random wifkey (could be better named)
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
  setBuyOrSellContract(state, { quantity, price, txnType, contract }) {
    state.quantity = quantity
    state.price = price
    state.currentTxnType = txnType
    state.contract = contract

    window.toggleWallet && window.toggleWallet()
  }
}

const getters = {
  getBuildRawTxMessage(state) {
    console.log(state.buildRawTxMessage)
    return state.buildRawTxMessage;
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
