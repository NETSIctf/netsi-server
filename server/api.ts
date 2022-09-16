import { WebSocket, WebSocketServer } from "ws";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import http from "http";
import * as dotenv from "dotenv";
dotenv.config();
import { verifyLogin } from "./util";
// API ROUTES
const apis = express.Router();

const WEBSOCKET_PORT = parseInt(process.env.WSPORT + "") || 4001;

// USERS
const userList = JSON.parse(process.env.users || "{}")

apis.post("/login", (req: Request, res: Response) => {
    if (userList.hasOwnProperty(req.body.username)) {
        bcrypt.compare(req.body.password, userList[req.body.username])
            .then(resolve => {
                if (resolve) {
                    res.status(200);
                    res.cookie("token", jwt.sign({ username: req.body.username, perms: "member" }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" }), { httpOnly: true, secure: true, sameSite: "strict" })
                    res.send("success");
                    res.end();
                } else {
                    res.status(401);
                    res.end("bad auth");
                    return;
                }
            })
            .catch(reject => {
                console.error(reject);
                res.status(500);
                res.end("server error");
                return;
            })
    } else {
        res.status(401);
        res.end("bad auth");
        return;
    }
})

//Monitors and websocket

const wss = new WebSocketServer({port: WEBSOCKET_PORT})
var connections: WebSocket[] = [];

function sendAll(data: any) {
    for (var i = 0; i < connections.length; i++) {
        connections[i].send(data);
    }
}

let monData: { data: string, headers: http.IncomingHttpHeaders }[] = [];
apis.all("/monitor", (req, res) => {
    let req2str = `${req.method} ${req.path} Cookies: ${JSON.stringify(req.cookies)} Body: ${JSON.stringify(req.body)}`;
    monData.push({ data: req2str, headers: req.headers });

    sendAll(req2str)

    res.end()
})

wss.on('connection', (ws) => {
    connections.push(ws)
    console.log("[WS] Connection recieved")

    ws.on('close', () => {
        connections.splice(connections.indexOf(ws), 1);
        console.log("[WS] Connection lost")
    })
})

apis.get("/login", (req, res) => {
    if (verifyLogin(req.cookies.token)) {
        res.status(200);
        res.end("success");
        return;
    } else {
        res.status(401);
        res.end("bad auth");
        return;
    }
})

apis.get("/status", (req, res) => {
    res.status(200);
    res.end("pong");
});

export default apis;