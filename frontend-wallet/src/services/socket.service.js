import socket from '../socket/socketconnect.js'
import { TokenForTokenTradeReceiver, LTCInstantTradeReceiver } from '../socket/receiver';
import { Notification } from '../store/channelsTrade.module';
import { store } from '../store'
import { rpcApis } from '../services/rpc-api.service';

socket.on("connect", () => {
  socket.emit('listeners-list', {});
});

socket.on("listeners-list", (listenersList) => {
  console.log(`Listeners list Received`)  
  window.listenersList = listenersList
})

socket.on('CHECK_COMMITS_RES', async (data) => {
  console.log({commitRes: data})
  const { commitsTxs, rawTx } = data;

  if (commitsTxs.every(tx => tx.isValid === true)) {
    const srtRes = await rpcApis.asyncTL('sendRawTx', rawTx);
    //handle errors;
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
  //handle errors;
  console.log({rawTx, isTlTxValid, tlTx});
  const message = 'Transaction Confirmed'
  store.commit('channelsTrade/setTxStatus', { rawTx, message });
  store.commit('channelsTrade/setTxNotification', new Notification('success', `Valid Transaction! \n ${tlTx}`));
});

const initNewReceiver = (listenerURL, options) => {
  console.log(`Init Connection with ${listenerURL}`);
  // return new TokenForTokenTradeReceiver(listenerURL);
  return new LTCInstantTradeReceiver(listenerURL);
};

export const socketService = {
  initNewReceiver
}