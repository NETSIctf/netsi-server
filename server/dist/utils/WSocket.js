"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WSocket_instances, _WSocket_onConnection;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const cookie_1 = __importDefault(require("cookie"));
const authMiddleware_1 = require("./authMiddleware");
class WSocket {
    constructor() {
        _WSocket_instances.add(this);
        this.message = [];
        this.io = new socket_io_1.Server();
        console.log("Constructed WSocket");
        this.io.on("connection", (socket) => __classPrivateFieldGet(this, _WSocket_instances, "m", _WSocket_onConnection).call(this, socket));
    }
    addMessage(message, handler) {
        this.message.push({ message: message, handler: (...all) => handler(...all) });
    }
    emit(event, ...args) {
        this.io.emit(event, ...args);
    }
    attach(server) {
        this.io.attach(server);
    }
}
exports.default = WSocket;
_WSocket_instances = new WeakSet(), _WSocket_onConnection = function _WSocket_onConnection(socket) {
    let cookies = cookie_1.default.parse(socket.handshake.headers.cookie || "");
    if (!cookies.token || !(0, authMiddleware_1.check_auth)(cookies.token, cookies.perms == "admin" ? "admin" : "user")) {
        socket.emit("bad auth");
        socket.disconnect();
        return;
    }
    this.message.forEach(i => {
        socket.on(i.message, (msg) => i.handler(msg, socket));
    });
};
