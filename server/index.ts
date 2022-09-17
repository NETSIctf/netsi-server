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

import apis from "./api";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", apis);

app.use("/assets", express.static("../client/dist/assets/"));
app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
})

if (process.env.NODE_ENV == "production") {
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/netsi.tk/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/netsi.tk/fullchain.pem')
    };

    http.createServer(app).listen(80);
    https.createServer(options, app).listen(443);

    webhookMessage("Server is online", "Server is online, listening at `netsi.tk`!", 65280)
} else {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}



process.on('uncaughtException', function (err) {
    console.error(err.stack);

    var errorMessage = err.stack + ""
    if (!err.stack) {
        errorMessage = "No error stack found... weird."
    }

    webhookMessage("Server Error!", errorMessage, 16711680)
});