import { constants } from '../../_shared/constants.js';
import RoomSocketBuilder from './util/roomSocket.js';

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

const socket = socketBuilder
  .setOnUserConnected((user) => console.log('user connected', user))
  .setOnUserDisconnected((user) => console.log('user disconnected', user))
  .setOnRoomUpdated((room) => console.log('room list!', room))
  .build();

const room = {
  id: '0001',
  topic: 'JS Expert test room',
};

const user = {
  img: 'https://pics.freeicons.io/uploads/icons/png/6822363841598811069-512.png',
  username: 'Victoria Cassolo ' + Date.now(),
};

socket.emit(constants.events.JOIN_ROOM, { user, room });
