import { Server, Socket } from "socket.io";
import http from "node:http";

export type messageListener = { message: string, handler: (msg: string, socket: Socket) => void }

export default class WSocket {
    io: Server;
    message: messageListener[] = new Array();

    constructor() {
        this.io = new Server();
        console.log("Constructed WSocket");
        this.io.on("connection", (socket) => this.#onConnection(socket));
    }

    #onConnection(socket: Socket) {
        console.log("User connected");

        this.message.forEach(i => {
            socket.on(i.message, (msg) => i.handler(msg, socket));
        });
    }

    addMessage(message: messageListener["message"], handler: messageListener["handler"]) {
        this.message.push({ message: message, handler: (...all) => handler(...all) });
    }

    emit(event: string, ...args: any[]) {
        this.io.emit(event, ...args);
    }

    attach(server: http.Server) {
        this.io.attach(server);
    }
}