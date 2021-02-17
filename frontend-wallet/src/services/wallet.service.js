import axios from "axios";
import { axiosInstance } from '../api/api'
const network = process.env.NETWORK || 'ltctest'
const {Unit} = require('litecore-lib')

// unused, leaving in case it's useful for dev
const getUTXOs2 = async (address) => {
  const apiURL = 'https://sochain.com/api/v2/get_tx_unspent';
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const result = await axios.get(`${apiURL}/${network}/${address}`, { headers });
  return result.data.data;
};


/**
     * Currently using external API for txn ids associated w/ address only; eventually these can be achieved from TL API
     */
const getUTXOs = (address, next)=>{
  axios.get(`https://api.bitaps.com/ltc/testnet/v1/blockchain/address/transactions/${address}`).then( async (res)=>{
    const txnData = res.data.data.list.map((txnObj)=> {
      return {
        txid: txnObj.txId,
        outsCount: txnObj.outsCount
      }
    }) 
    
    axiosInstance.post("/txn/utxos", {txnData, address}).then((data)=>{
      
      const utxoDataFormatted = data.data.map((utxo)=> {
        return {
          txid: utxo.txid,
          outputIndex: utxo.outputIndex,
          script: utxo.scriptPubKey.hex,
          satoshis: btcToSats(utxo.value),          
        }
      })
      next(utxoDataFormatted)
      
    }).catch((err)=>{
      console.warn(err);
    })
  }).catch((err)=>{
    const {response} = err
    if(response.data.details === 404 && response.data.message === "address not found"){
      next([])
    } else {
      console.warn(err);
      
    }
    
  })
}

const mapToTxnFormat = (txn)=>{
  return {
    txid: txn.txid,
    outputIndex: txn.output_no,
    script: txn.script_hex,
    satoshis: btcToSats(txn.value),
    // or amount
  }
}

const sendRawTxn = (rawTxn)=> {
  return axiosInstance.post('/txn', {rawTxn})
}

const btcToSats = (value)=>{
  if (typeof value === 'string'){
    value = Number(value)
  } 

  return Unit.fromBTC (value).toSatoshis() 
}


const _getPayload = (url, data)=>{
  return axiosInstance.post(url, data)
}

const getSendPeggedPayload = (amount, contractId)=>{
  return _getPayload('dcurrency/sendPeggedPayload', {amount,contractID})
}

const getRedeemPeggedPayload = (amount, name)=>{
  return _getPayload('dcurrency/redeemPeggedPayload',{amount,name})
}

const getSendIssuancePeggedPayload = (qty, name, contractID) =>{
  return _getPayload('dcurrency/sendIssuancePeggedPayload',{qty, name, contractID})

}

const txnTypeEnum = {
  LTC_SEND: 0,
  BUY_CONTRACT: 1,
  SELL_CONTRACT: 2,
  ISSUE_CURRENCY: 3,
  REDEEM_CURRENCY: 4,
  PROPOSE_CHANNEL: 5,
  SIMPLE_SEND: 6,
  CUSTOM_PAYLOAD: 7,
  LTC_INSTANT_TRADE:8,
}

const buildRawTx = async (buildOptions) => {
  const resultBuildTx = await axiosInstance.get('/txn/buildRawTx', { params: buildOptions })
  return resultBuildTx.data;
}

const signRawTx = async (rawTx) => {
  const signedRawTxResult = await axiosInstance.get('/txn/signRawTx', { params: { rawTx } });
  return signedRawTxResult.data;
};
const sendRawTx = async (rawTx) => {
  const signedRawTxResult = await axiosInstance.get('/txn/sendRawTx', { params: { rawTx } });
  return signedRawTxResult.data;
}
const decodeRawTx = async (rawTx) => {
  const decodedRawTxJson = await axiosInstance.get('/txn/decodeRawTx', { params: { rawTx } });
  return decodedRawTxJson.data
}
const createSimpleSendPayload = async (payloadParams) => {
  const payloadResult = await axiosInstance.get('/txn/getSimpleSendPayload', { params: payloadParams });
  return payloadResult.data;
}

const validateAddress = async (address) => {
  const validateAddressResult = await axiosInstance.get('/address/validateAddress', { params: { address } });
  return validateAddressResult.data
}

export const walletService = {
  getUTXOs,
  getUTXOs2,
  sendRawTxn, 
  txnTypeEnum, 
  getSendIssuancePeggedPayload,
  getRedeemPeggedPayload, 
  getSendIssuancePeggedPayload,
  buildRawTx,
  signRawTx,
  decodeRawTx,
  sendRawTx,
  createSimpleSendPayload,
  validateAddress,
};
