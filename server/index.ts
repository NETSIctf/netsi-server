import path from "path";
import url from "url";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();
import http from "http";
import https from "https";
import fs from "fs";
import axios from "axios"
import apis from "./api";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(cookieParser())

// WEBHOOK POSTING

/**
 * Sends an embed to the webhook
 * 
 * @arg title Title of embed
 * @arg description Description of embed
 * @arg color https://www.spycolor.com/
 */
function webhookMessage(title: String, description: String, color: number) {
    const data = {
        embeds: [{
            title: title,
            description: description,
            color: color
        }]
    }

    axios.post("https://discord.com/api/webhooks/1016905904093925406/hQpKUm3elqbBKw7XIipjcODkVtwshuOiDfbORhGNIUUe9OwTRpqCp24Pv5UI0NVU9Giv", data)
}

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