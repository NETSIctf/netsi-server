import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyLogin from "../utils/verifyLogin";
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";

const sudoers = JSON.parse(process.env.users || "{}");

const db = new sqlite3.Database("user.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});

// create ctfs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users(
    uuid TEXT NOT NULL UNIQUE, 
    username TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL)`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Initialized user DB");
});

export default function userApi(apis: Router) {
    apis.post("/login", (req: Request, res: Response) => {
        /*db.get(`SELECT * FROM ctfs WHERE name = ?`, [req.body.username], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500);
                res.end("server error");
                return;
            }

            if (row == )
        })*/

        if (sudoers.hasOwnProperty(req.body.username)) {
            bcrypt.compare(req.body.password, sudoers[req.body.username])
                .then(resolve => {
                    if (resolve) {
                        res.status(200);
                        res.cookie("token", jwt.sign({ username: req.body.username, perms: "admin" }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" }), { httpOnly: true, secure: true, sameSite: "strict" })
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
    });

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
    });

    apis.get("/logout", (req, res) => {
        res.status(200);
        res.clearCookie("token");
        res.end("success");
        return;
    });

    apis.post("/create", (req, res) => {
        console.log(`ADMIN: Attempting to create user ${req.body.username}`);

        if (verifyLogin(req.cookies.token)) {
            let data = (jwt.verify(req.cookies.token, process.env.jwt_secret + "", { algorithms: ["HS256"] }) as any);

            if (sudoers.hasOwnProperty(data.username)) {
                bcrypt.hash(req.body.password, 12).then((resolve) => {
                    db.run("INSERT INTO users (uuid, username, password) VALUES (?, ?, ?)", [uuidv4(), req.body.username, resolve], (err) => {
                        if (err) {
                            if (err.message.includes("UNIQUE constraint failed")) {
                                console.error("UNIQUE constraint failed");

                                res.status(409);
                                res.end("uname/pwd already exists");
                                return;
                            } else {
                                res.status(500);
                                res.end("server error");
                                throw err;
                            }
                        } else {
                            console.log(`Created User ${req.body.username}`);
                            res.status(200);
                            res.end("success");
                            return;
                        }
                    });
                })
            } else {
                res.status(401);
                res.end("bad auth");
                return;
            }
        } else {
            res.status(401);
            res.end("bad auth");
            return;
        }
    })
}