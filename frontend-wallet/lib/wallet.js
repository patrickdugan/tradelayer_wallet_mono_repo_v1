const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
const bs58 = require('bs58')
const bitcoin = require('bitcoinjs-lib')
const Cryptr = require('cryptr');

const litecore = require('litecore-lib')



// testnet
const LITECOIN = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4, //  for segwit (start with 2)
  wif: 0xef
}

const generateKeyPair = () => {
  const keyPair = bitcoin.ECPair.makeRandom({ network: LITECOIN })
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: LITECOIN })
  const wifKey = keyPair.toWIF()
  return {
    wifKey,
    publicAddress: address
  }

}

const wifToPubKey = (wifKey) => {
  const privateKey = new litecore.PrivateKey(wifKey);

  return privateKey.toAddress().toString();
}

const wifToPublicKey = (wifKey) => new litecore.PrivateKey(wifKey).toPublicKey().toString();

// bip38's encrypt/decrypt is incredibly slow, swapping for Cryptr for now:
const encryptKey = (wifKey, password) => {
  const cryptr = new Cryptr(password);
  return cryptr.encrypt(wifKey);
}

//**
//  * 
//  * @param {String} encryptedKey 
//  * @param {String} password 
//  * returns decrypted key (String) if success, false if failure
//  */
const decryptKey = (encryptedKey, password) => {
  const cryptr = new Cryptr(password);
  const decrypted = cryptr.decrypt(encryptedKey);
  const rePattern = /[^A-Za-z0-9]+/g
  return decrypted.length === 52 && !rePattern.test(decrypted) ? decrypted : false;

}


const createTxn = (utxo, to, sats, change) => {
  return new litecore.Transaction()
    .from(utxo)
    .to(to, sats)
    .change(change)
}

const createOpReturnTxn = (utxo, to, sats, change, data) => {
  return new litecore.Transaction()
    .from(utxo)
    .to(to, sats)
    .addData(data)
    .change(change)
}



const signTxn = (txn, wifKey) => {
  const privateKey = new litecore.PrivateKey(wifKey);
  return txn.sign(wifKey)
}

const txsJsonLink = (data) => {
  const json = JSON.stringify(data)
  const link = document.createElement('a');
  const blob = new Blob([json], { type: `application/json`});
  link.download='tradeLayerTxs.json'
  link.href = window.URL.createObjectURL(blob)
  return link;
}

module.exports = {
  txsJsonLink, wifToPubKey, encryptKey, decryptKey, generateKeyPair, createTxn, signTxn, createOpReturnTxn, wifToPublicKey
}
