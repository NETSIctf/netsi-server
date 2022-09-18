import path from "path";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();
import http from "http";
import https from "https";
import fs from "fs";
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

    let server = http.createServer(app).listen(80);
    https.createServer(options, app).listen(443);

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

    webhookMessage("Server Error!", errorMessage, 16711680)
});