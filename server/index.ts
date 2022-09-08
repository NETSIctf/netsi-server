import path from "path";
import url from "url";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import http from "http";
import https from "https";
import fs from "fs";
import axios from "axios"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

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

function verifyLogin(token: string | undefined) {
    try {
        if (token && jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
            return true;
        }
    } catch(err) {
        return false;
    }
}

// API ROUTES
const apis = express.Router();

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