import { constants } from "../../_shared/constants.js";
import LobbyController from "./controller.js";
import LobbySocketBuilder from "./util/lobbySocketBuilder.js";

const user = {
    img: './../../assets//avatars/ivete-souza.png',
    username: 'Victoria Cassolo ' + Date.now(),
};

const socketBuilder = new LobbySocketBuilder({ socketUrl: constants.socketUrl, namespace: constants.socketNamespaces.lobby })

const dependencies = {
    socketBuilder, user
}

await LobbyController.initialize(dependencies)