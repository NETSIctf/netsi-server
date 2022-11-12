"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WSocket_instances, _WSocket_io, _WSocket_message, _WSocket_onConnection;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class WSocket {
    constructor(server) {
        _WSocket_instances.add(this);
        _WSocket_io.set(this, void 0);
        _WSocket_message.set(this, []);
        __classPrivateFieldSet(this, _WSocket_io, new socket_io_1.Server(server), "f");
        __classPrivateFieldGet(this, _WSocket_io, "f").on("connection", __classPrivateFieldGet(this, _WSocket_instances, "m", _WSocket_onConnection));
    }
    addMessage(listener) {
        __classPrivateFieldGet(this, _WSocket_message, "f").push(listener);
    }
}
_WSocket_io = new WeakMap(), _WSocket_message = new WeakMap(), _WSocket_instances = new WeakSet(), _WSocket_onConnection = function _WSocket_onConnection(socket) {
    __classPrivateFieldGet(this, _WSocket_message, "f").forEach(i => {
        socket.on(i.message, (msg) => i.handler(msg, socket));
    });
};
