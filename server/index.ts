const oldLog = console.log.bind(console);

console.log = (message?: any, ...optionalParams: any[]) => {
    oldLog(`[${new Date().toUTCString()}]`, message, ...optionalParams);
}

import path from "path";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();
import http from "http";
import https from "https";
import fs from "node:fs";
import morgan from "morgan";
import webhookMessage from "./utils/webhookMessage.js";
import WSocket from "./utils/WSocket.js";

import apis from "./api";

// Init
const socketManager = new WSocket();

const app = express();
const PORT = process.env.PORT || 4000;

// Request Body/Cookies
app.use(bodyParser.json());
app.use(cookieParser());

app.use((request, response, next) => { // Upgrade to secure
    if (process.env.NODE_ENV == "production" && !request.secure) {
        return response.redirect("https://" + request.headers.host + request.url);
    }

    next();
})

var accessLogStream = fs.createWriteStream('access.log', { flags: 'a' })
app.use(morgan("combined", { stream: accessLogStream }));

// routes
app.use("/api", apis(socketManager)); // ALL apis

app.use("/assets", express.static("../client/dist/assets/")); // production files

app.get("*", (req: Request, res: Response) => { // production main page
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
})

// Server creation
if (process.env.NODE_ENV == "production") {
    const options = { // ssl
        key: fs.readFileSync('/etc/letsencrypt/live/netsi.tk/privkey.pem'), // instance specific keys (certbot)
        cert: fs.readFileSync('/etc/letsencrypt/live/netsi.tk/fullchain.pem')
    };

    http.createServer(app).listen(80);
    let server = https.createServer(options, app).listen(443);

    socketManager.attach(server);

    webhookMessage("Server is online", "Server is online, listening at `netsi.tk`!", 65280);
} else {
    let server = http.createServer(app).listen(PORT);

    socketManager.attach(server);

    console.log(`Server listening on port ${PORT}`);
}

process.on('uncaughtException', function (err) {
    console.error(err.stack);

    var errorMessage = err.stack + ""
    if (!err.stack) {
        errorMessage = "No error stack found... weird."
    }

    webhookMessage("Server Error!", errorMessage, 16711680);
});