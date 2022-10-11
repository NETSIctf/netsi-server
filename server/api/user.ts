import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

function signToken(username: string, perms: "user" | "admin") {
    return jwt.sign({ username: username, perms: perms }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" });
}

function getUser(username: string) {
    return new Promise((resolve: (row: any) => void, reject: (err: Error) => void) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        })
    })
}

export default function userApi(apis: Router) {
    apis.post("/login", async (req: Request, res: Response) => {
        const username: string = req.body?.username;
        const password: string = req.body?.password;

        if (!username) {
            res.status(400);
            res.end("Username cannot be empty");
            return false;
        }
        if (!password) {
            res.status(400);
            res.end("Password cannot be empty");
            return false;
        }

        var hash = "";
        var type: Parameters<typeof signToken>[1] = "user";

        if (sudoers.hasOwnProperty(username)) {
            hash = sudoers[username];
            type = "admin";
        } else {
            let user = await getUser(username);
            hash = user.password;
            type = "user";
        }

        if (await bcrypt.compare(password, hash)) {
            res.status(200);
            res.cookie("token", signToken(username, type), { httpOnly: true, secure: true, sameSite: "strict" });
            res.cookie("username", username);
            res.end("success");
        } else {
            res.auth_fail();
        }
    });

    apis.get("/login", (req, res) => {
        let userOrAdmin = "user";
        if (req.query.admin && req.query.admin !== "false") {
            userOrAdmin = "admin";
        }
        if (req.check_auth(userOrAdmin)) {
            res.status(200);
            res.end("success");
        }
    });

    apis.get("/logout", (req, res) => {
        res.clearCookie("token"); res.clearCookie("uuid"); res.clearCookie("username");
        res.status(200);
        res.end("success");
        return;
    });

    apis.post("/create", (req, res) => {
        console.log(`CREATE new user ${req.body.username}`);

        const username = req.body?.username;
        const password = req.body?.password;

        // disallow empty username
        if (!username) {
            res.status(400);
            res.end("Username cannot be empty");
            return;
        }

        // disallow empty password
        if (!password) {
            res.status(400);
            res.end("Password cannot be empty");
            return;
        }

        bcrypt.hash(req.body.password, 12).then((resolve) => {
            db.run("INSERT INTO users (uuid, username, password) VALUES (?, ?, ?)", [uuidv4(), req.body.username, resolve], (err) => {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        console.error("UNIQUE constraint failed");

                        res.status(409);
                        res.end("username already exists");
                        return;
                    } else {
                        res.status(500);
                        res.end("server error");
                        throw err;
                    }
                } else {
                    console.log(`Created User ${req.body.username}`);
                    res.status(200);
                    res.cookie("token", signToken(username, "user"), { httpOnly: true, secure: true, sameSite: "strict" });
                    res.end("success");
                    return;
                }
            });
        })
    })
}
