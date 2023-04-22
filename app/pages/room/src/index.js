import { constants } from '../../_shared/constants.js';
import RoomController from './controller.js';
import RoomSocketBuilder from './util/roomSocket.js';
import View from './view.js';

const room = {
  id: '0001',
  topic: 'JS Expert test room',
};

const user = {
  img: './../../assets//avatars/ivete-souza.png',
  username: 'Victoria Cassolo ' + Date.now(),
};

const roomInfo = { user, room }

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

const dependencies = {
  view: View,
  socketBuilder,
  roomInfo

}


await RoomController.initialize(dependencies)