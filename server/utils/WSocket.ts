import { Server, Socket } from "socket.io";
import http from "node:http";

export type messageListener = { message: string, handler: (msg: string, socket: Socket) => void }

export default class WSocket {
    #io: Server;
    #message: messageListener[] = [];

    constructor(server: http.Server) {
        this.#io = new Server(server);
        this.#io.on("connection", this.#onConnection);
    }

    #onConnection(socket: Socket) {
        this.#message.forEach(i => {
            socket.on(i.message, (msg) => i.handler(msg, socket))
        })
    }

    addMessage(listener: messageListener) {
        this.#message.push(listener);
    }

    emit(event: string, ...args: any[]) {
        this.#io.emit(event, ...args);
    }
}