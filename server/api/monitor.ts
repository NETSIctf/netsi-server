import { Router } from "express";
import http from "http";
import { Socket } from "socket.io";
import WSocket from "../utils/WSocket";


export default function monitorApi(apis: Router, socketManager: WSocket) {
    let monData: { data: string, headers: http.IncomingHttpHeaders }[] = [];
    let sockets: Socket[] = [];

    apis.all("/monitor", (req, res) => {
        let req2str = `${req.method} ${req.path} Cookies: ${JSON.stringify(req.cookies)} Body: ${JSON.stringify(req.body)}`;
        monData.push({ data: req2str, headers: req.headers });

        var toSend = JSON.stringify({ data: req2str, headers: req.headers })
        sockets.forEach(s => {
            s.emit("monDataUpdate", toSend);
        })

        res.status(200);
        res.end("request logged");
    })

    socketManager.addMessage("initMonitor", (msg, socket) => {
        console.log("monDataInit");
        sockets.push(socket);
        socket.emit("monDataInit", JSON.stringify(monData));
    })
}