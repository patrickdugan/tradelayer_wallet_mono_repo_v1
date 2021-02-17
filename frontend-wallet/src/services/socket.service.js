import socket from '../socket/socketconnect.js'
import { TokenForTokenTradeReceiver, LTCInstantTradeReceiver } from '../socket/receiver';
import { Notification } from '../store/channelsTrade.module';
import { store } from '../store'
import { rpcApis } from '../services/rpc-api.service';
import { walletService } from '../services/wallet.service';
const { txnTypeEnum } = walletService
socket.on("connect", () => {
  socket.emit('listeners-list', {});
});

socket.on("listeners-list", (listenersList) => {
  console.log(`Listeners list Received`)  
  window.listenersList = listenersList
})

socket.on('CHECK_COMMITS_RES', async (data) => {
  const { commitsTxs, rawTx } = data;

  if (commitsTxs.every(tx => tx.isValid === true)) {
    const srtRes = await rpcApis.asyncTL('sendRawTx', rawTx);
    if (srtRes.error || !srtRes.data) return console.error(error.message || 'Error with Sending TL Trassnaction')
    const tlTx = srtRes.data;
    const checkTlTxObj = { rawTx, tlTx };
    socket.emit('CHECK_TL_TX', checkTlTxObj);
    const message = 'Waiting TL TX to be confirmed'
    store.commit('channelsTrade/setTlTx', { rawTx, tlTx });
    store.commit('channelsTrade/setTxStatus', { rawTx, message });
  }
});

socket.on('CHECK_TL_TX_RES', (data) => {
  const { rawTx, isTlTxValid, tlTx } = data;
  if (!isTlTxValid) {
    const message = 'Transaction is Invalid'
    store.commit('channelsTrade/setTxStatus', { rawTx, message });
    store.commit('channelsTrade/setTxNotification', new Notification('danger', `Invalid Transaction! \n ${tlTx}`));
  } else {
    const message = 'Transaction Confirmed'
    store.commit('channelsTrade/setTxStatus', { rawTx, message });
    store.commit('channelsTrade/setTxNotification', new Notification('success', `Valid Transaction! \n ${tlTx}`));
  }
});

const initNewReceiver = (listenerURL, options) => {
  console.log(options)

  switch (options.type) {
    case txnTypeEnum.BUY_CONTRACT:
    case txnTypeEnum.SELL_CONTRACT:
      return new TokenForTokenTradeReceiver(listenerURL, options);
    case txnTypeEnum.LTC_INSTANT_TRADE:
      return new LTCInstantTradeReceiver(listenerURL, options);
    default:
      break;
  }
};

export const socketService = {
  initNewReceiver
}