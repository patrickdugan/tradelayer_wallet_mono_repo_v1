import socket from '../socket/socketconnect.js'
import Receiver from '../socket/receiver';

socket.on("connect", () => {
  socket.emit('listeners-list', {});
});

socket.on("listeners-list", (listenersList) => {
  console.log(`Listeners list Received`)
  initNewReceiver(listenersList[0], {});
})

const initNewReceiver = (listenerURL, options) => {
  console.log(`Init Connection with ${listenerURL}`);
  new Receiver(listenerURL, options)
};

export const socketService = {
  initNewReceiver
}