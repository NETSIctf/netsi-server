import { Server, Socket } from "socket.io";
import http from "node:http";

export type messageListener = { message: string, handler: (msg: string, socket: Socket) => void }

export default class WSocket {
    #io: Server = new Server();
    #message: messageListener[] = [];

    constructor() {
        this.#io.on("connection", this.#onConnection);
    }

    #onConnection(socket: Socket) {
        this.#message.forEach(i => {
            socket.on(i.message, (msg) => i.handler(msg, socket))
        })
    }

    addMessage(message: messageListener["message"], handler: messageListener["handler"]) {
        this.#message.push({ message: message, handler: handler });
    }

    emit(event: string, ...args: any[]) {
        this.#io.emit(event, ...args);
    }

    attach(server: http.Server) {
        this.#io.attach(server);
    }
}