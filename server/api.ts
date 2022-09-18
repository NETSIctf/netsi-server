import express from "express";
import verifyLogin from "./utils/verifyLogin";
import sqlite3 from "sqlite3";

import userApi from "./api/user";
import monitorApi from "./api/monitor";
import WSocket from "./utils/WSocket";

export default function apis(socketManager: WSocket) {
    // API ROUTES
    const router = express.Router();

    userApi(router);
    monitorApi(router, socketManager);

    router.get("/status", (req, res) => {
        res.status(200);
        res.end("pong");
    });

    const db = new sqlite3.Database(".db", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database.");
    });

    // create ctfs table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS ctfs( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL)`, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Initialized ctfs table");
    });


    router.post("/ctfs/add", (req, res) => {
        // adds a new ctf
        if (verifyLogin(req.cookies.token)) {
            db.run("INSERT INTO ctfs (name, description) VALUES (?, ?)", [req.body.name, req.body.description], function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        res.status(409);
                        res.end("ctf already exists");
                        return;
                    }
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                    return;
                }
                res.status(200);
                res.end("success");
                return;
            })
        }
        else {
            res.status(401);
            res.end("bad auth");
            return;
        }
    })

    router.get("/ctfs/list", (req, res) => {
        // lists all ctfs
        if (verifyLogin(req.cookies.token)) {
            db.all("SELECT name FROM ctfs", [], (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                    return;
                }
                res.status(200);
                res.json(rows);
                return;
            })
        }
    })

    return router;
}