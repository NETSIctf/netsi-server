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

export default function userApi(apis: Router) {
    apis.post("/login", async (req: Request, res: Response) => {
        if (sudoers.hasOwnProperty(req.body.username)) { // ADMIN
            if (await bcrypt.compare(req.body.password, sudoers[req.body.username])) {
                res.status(200);
                res.cookie("token", jwt.sign({ username: req.body.username, perms: "admin" }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" }), { httpOnly: true, secure: true, sameSite: "strict" })
                res.cookie("username", req.body.username, { httpOnly: false, secure: true, sameSite: "strict" })
                res.end("success");
            } else {
                res.auth_fail();
            }
        } else { // NORMAL USER
            db.get(`SELECT * FROM users WHERE username = ?`, [req.body.username], async (err, row) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                }
                if (row && await bcrypt.compare(req.body.password, row.password)) {
                    res.status(200);
                    res.cookie("token", jwt.sign({ username: req.body.username, perms: "user" }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" }), { httpOnly: true, secure: true, sameSite: "strict" })
                    res.cookie("username", row.username, { httpOnly: false, secure: true, sameSite: "strict" })
                    res.end("success");
                } else {
                    res.auth_fail();
                }
            });
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

        // disallow empty username
        if (req.body.username === "" || req.body.username === undefined) {
            res.status(400);
            res.end("Username cannot be empty");
            return;
        }

        // disallow empty password
        if (req.body.password === "" || req.body.password === undefined) {
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
                }

                else {
                    console.log(`Created User ${req.body.username}`);
                    res.status(200);
                    res.cookie("token", jwt.sign({ username: req.body.username, perms: "user" }, process.env.jwt_secret + "", { algorithm: "HS256", expiresIn: "7d" }), { httpOnly: true, secure: true, sameSite: "strict" })
                    res.end("success");
                    return;
                }
            });
        })
    })
}