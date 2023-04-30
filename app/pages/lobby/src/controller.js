export default class LobbyController {
    constructor({ socketBuilder, user }) {
        this.socketBuilder = socketBuilder,
            this.user = user,
            this.socket = {}

    }

    static initialize(deps) {
        return new LobbyController(deps)._init()
    }

    async _init() {
        this.socket = this._setupSocket()

    }

    _setupSocket() {
        this.socketBuilder.setOnLobbyUpdated(this.onLobbyUpdated())
    }

    onLobbyUpdated() {
        return (rooms) => {
            console.log('rooms', rooms)
        }
    }
}