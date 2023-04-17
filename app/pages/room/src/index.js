import { constants } from '../../_shared/constants.js';
import SocketBuilder from '../../_shared/socketBuilder.js';

const socketBuilder = new SocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

const socket = socketBuilder
  .setOnUserConnected((user) => console.log('user connected', user))
  .setOnUserDisconnected((user) => console.log('user disconnected', user))
  .build();

const room = {
  id: Date.now(),
  topic: 'JS Expert test room',
};

const user = {
  img: 'https://pics.freeicons.io/uploads/icons/png/6822363841598811069-512.png',
  username: 'Victoria Cassolo',
};

socket.emit(constants.events.JOIN_ROOM, { user, room });
