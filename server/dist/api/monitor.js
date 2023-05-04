"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function monitorApi(apis, socketManager) {
    let monData = [];
    let sockets = [];
    apis.all("/monitor", (req, res) => {
        let req2str = `${req.method} ${req.path} Query: ${JSON.stringify(req.query)} Body: ${JSON.stringify(req.body)}`;
        monData.push({ data: req2str, headers: req.headers });
        var toSend = JSON.stringify({ data: req2str, headers: req.headers });
        sockets.forEach(s => {
            s.emit("monDataUpdate", toSend);
        });
        res.status(200);
        res.end("request logged");
    });
    socketManager.addMessage("initMonitor", (msg, socket) => {
        sockets.push(socket);
        socket.emit("monDataInit", JSON.stringify(monData));
    });
}
exports.default = monitorApi;
