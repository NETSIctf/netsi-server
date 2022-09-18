import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyLogin from "../utils/verifyLogin";

const userList = JSON.parse(process.env.users || "{}");

export default function userApi(apis: Router) {
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

    apis.get("/logout", (req, res) => {
        res.status(200);
        res.clearCookie("token");
        res.end("success");
        return;
    })
}