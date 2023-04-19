import RoomsController from './controllers/roomsController.js';
import { constants } from './util/constants.js';
import SocketServer from './util/socket.js';
import Event from 'events';

const port = process.env.PORT || 3000;
const socketServer = new SocketServer({ port });
const server = await socketServer.start();

const roomController = new RoomsController();

const namespaces = {
  room: { controller: roomController, eventEmitter: new Event() },
};

// namespaces.room.eventEmitter.on(
//   'userConnected',
//   namespaces.room.controller.onNewConnection.bind(namespaces.room.controller)
// );

// namespaces.room.eventEmitter.emit('userConnected', { id: '001' });
// namespaces.room.eventEmitter.emit('userConnected', { id: '002' });
// namespaces.room.eventEmitter.emit('userConnected', { id: '003' });

const routeConfig = Object.entries(namespaces).map(
  ([namespace, { controller, eventEmitter }]) => {
    const controllerEvents = controller.getEvents();
    eventEmitter.on(
      constants.event.USER_CONNECTED,
      controller.onNewConnection.bind(controller)
    );

    return {
      [namespace]: { events: controllerEvents, eventEmitter },
    };
  }
);

socketServer.attachEvents({ routeConfig });

console.log('socket server is running at', server.address().port);
