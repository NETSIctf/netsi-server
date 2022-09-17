import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import http from "http";
import jwt from "jsonwebtoken";
import verifyLogin from "./utils/verifyLogin";

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

let monData: { data: string, headers: http.IncomingHttpHeaders }[] = [];
apis.all("/monitor", (req, res) => {
    let req2str = `${req.method} ${req.path} Cookies: ${JSON.stringify(req.cookies)} Body: ${JSON.stringify(req.body)}`;
    monData.push({ data: req2str, headers: req.headers });

    res.status(200);
    res.end("request logged");
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

apis.get("/logout", (req, res) => {
    res.status(200);
    res.clearCookie("token");
    res.end("success");
    return;
})

apis.get("/status", (req, res) => {
    res.status(200);
    res.end("pong");
});

export default apis;