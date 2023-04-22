import Attendee from '../entities/attendee.js';
import Room from '../entities/room.js';
import { constants } from '../util/constants.js';

export default class RoomsController {
  _users = new Map();
  constructor() {
    this.rooms = new Map();
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log('connection stablished with', id);
    this._updateGlobalUserData(id);
  }

  disconnect(socket) {
    console.log('disconnect!!', socket.id)
    this._logoutUser(socket)
  }

  _logoutUser(socket) {
    const userId = socket.id
    const user = this._users.get(userId)
    const roomId = user.roomId

    //remover user da lista de usuários ativos
    this._users.delete(userId)

    //caso seja um usuario sujeira que estava em uma sala que nao existe mais
    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId)
    const toBeRemoved = [...room.users].find(({ id }) => id === userId)
    // removemos o usuario da sala
    room.users.delete(toBeRemoved)

    // se nao tiver mais nenhum usuario na sala fechamos a sala
    if (!room.users.size) {
      this.rooms.delete(roomId)
      return;
    }

    const disconnectedUserWasAnOwner = userId === room.owner.id
    const onlyOneUserLeft = room.users.size === 1

    // validar se tem somente um usuario ou se o usuario era o dono da sala
    if (onlyOneUserLeft || disconnectedUserWasAnOwner) {
      room.owner = this._getNewRoomOwner(room, socket)
    }

    // atualiza a room no final
    this.rooms.set(roomId, room)

    //notifica a sala que o usuario se desconectou
    socket.to(roomId).emit(constants.event.USER_DISCONNECTED, user)

  }

  _getNewRoomOwner(room, socket) {
    const users = [...room.users.values()]
    const activeSpeakers = users.find(user => user.isSpeaker)

    // se quem desconectou era o dono, passa a liderança para o proximo
    //se não houver speakers, ele pega o attendee mais antigo (primeira posição)
    const [newOwner] = activeSpeakers ? [activeSpeakers] : users
    newOwner.isSpeaker = true

    const outdatedUser = this._users.get(newOwner.id)
    const updatedUser = new Attendee({
      ...outdatedUser, ...newOwner
    })

    this._users.set(newOwner.id, updatedUser)

    return newOwner
  }

  joinRoom(socket, { user, room }) {
    const userId = (user.id = socket.id);
    const roomId = room.id;

    const updatedUserData = this._updateGlobalUserData(userId, user, roomId);

    const updatedRoom = this._joinUserRoom(socket, updatedUserData, room);
    this._notifyUsersOnRoom(socket, roomId, updatedUserData);
    this._replyWithActiveUsers(socket, updatedRoom.users);
  }

  _replyWithActiveUsers(socket, users) {
    const event = constants.event.LOBBY_UPDATED;
    socket.emit(event, [...users.values()]);
  }

  _notifyUsersOnRoom(socket, roomId, user) {
    const event = constants.event.USER_CONNECTED;
    socket.to(roomId).emit(event, user);
  }

  _joinUserRoom(socket, user, room) {
    const roomId = room.id;
    const existingRoom = this.rooms.has(roomId);
    const currentRoom = existingRoom ? this.rooms.get(roomId) : {};
    const currentUser = new Attendee({
      ...user,
      roomId,
    });

    //definir quem é o dono da sala
    const [owner, users] = existingRoom
      ? [currentRoom.owner, currentRoom.users]
      : [currentUser, new Set()];

    const updatedRoom = this._mapRoom({
      ...currentRoom,
      ...room,
      owner,
      users: new Set([...users, ...[currentUser]]),
    });

    this.rooms.set(roomId, updatedRoom);

    socket.join(roomId);

    return this.rooms.get(roomId);
  }

  _mapRoom(room) {
    const users = [...room.users.values()];
    const speakersCount = users.filter((user) => user.isSpeaker).length;
    const featuredAttendees = users.slice(0, 3);
    const mappedRoom = new Room({
      ...room,
      featuredAttendees,
      speakersCount,
      attendeesCount: room.users.size,
    });

    return mappedRoom;
  }

  _updateGlobalUserData(userId, userData = {}, roomId = '') {
    const user = this._users.get(userId) ?? {};
    const existingRoom = this.rooms.has(roomId);

    const updatedUserData = new Attendee({
      ...user,
      ...userData,
      roomId,
      //se for o unico na sala
      isSpeaker: !existingRoom,
    });
    this._users.set(userId, updatedUserData);

    return this._users.get(userId);
  }

  getEvents() {
    const functions = Reflect.ownKeys(RoomsController.prototype)
      .filter((fn) => fn !== 'constructor')
      .map((name) => [name, this[name].bind(this)]);

    return new Map(functions);
  }
}
