import socket from '../socket/socketconnect.js'
import Receiver from '../socket/receiver';
import { Notification } from '../store/channelsTrade.module';
import { store } from '../store'

socket.on("connect", () => {
  socket.emit('listeners-list', {});
});

socket.on("listeners-list", (listenersList) => {
  console.log(`Listeners list Received`)  
  window.listenersList = listenersList
})

socket.on('validCommits', (data) => {
  const { listenerCommitIsValid, receiverCommitIsValid, rawTx } = data;
  if (!listenerCommitIsValid && !listenerCommitIsValid) {
      const message = "Both channel commit are not valid!";
      store.commit('channelsTrade/setLastTxsStatus', { rawTx, message })
      store.commit('channelsTrade/setTxNotification', new Notification('error', message))
      return;
  }
  if (!listenerCommitIsValid) {
      const message = "Listener's channel commit is not valid!";
      store.commit('channelsTrade/setLastTxsStatus', { rawTx, message })
      store.commit('channelsTrade/setTxNotification', new Notification('error', message))
      return;
  }
  if (!receiverCommitIsValid) {
      const message = "Your channel commit is not valid!";
      store.commit('channelsTrade/setLastTxsStatus', { rawTx, message })
      store.commit('channelsTrade/setTxNotification', new Notification('error', message))
      return
  }
});

socket.on('validLastTx', (data) => {
  const { rawTx, result, tlTx } = data;
  if (!result) {
      store.commit('channelsTrade/setLastTxsStatus', { rawTx, message: `Invalid` })
      store.commit('channelsTrade/setTxNotification', new Notification('error', `Invalid Transaction! \n ${tlTx}`))
      return;
  }
  store.commit('channelsTrade/setLastTxsStatus', { rawTx, message: `Valid` });
  store.commit('channelsTrade/setTxNotification', new Notification('success', `Valid Transaction! \n ${tlTx}`));
  return;
});

const initNewReceiver = (listenerURL, options) => {
  console.log(`Init Connection with ${listenerURL}`);
  return new Receiver(listenerURL, options)
};

export const socketService = {
  initNewReceiver
}