export default class LobbyController {
    constructor({ activeRooms, roomsListener }) {
        this.activeRooms = activeRooms,
            this.roomsListener = roomsListener
    }

    onNewConnection(socket) {
        const { id } = socket;
        console.log('Lobby connection stablished with ' + id)

    }

    getEvents() {
        const functions = Reflect.ownKeys(LobbyController.prototype)
            .filter((fn) => fn !== 'constructor')
            .map((name) => [name, this[name].bind(this)]);

        return new Map(functions);
    }
}