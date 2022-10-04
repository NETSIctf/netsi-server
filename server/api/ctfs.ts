import { Router } from "express";

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("ctf.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});

// create ctfs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS ctfs( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    start DATE NOT NULL,
    end DATE NOT NULL,
    members TEXT UNIQUE)`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Initialized ctf DB");
});

export default function ctf() {
    const router = Router();

    router.post("/add", (req, res) => {
        // adds a new ctf
        if (req.check_auth("admin")) {
            // prevent spaces, slashes, or is empty in ctf name
            if (req.body.name.includes(" ") || req.body.name.includes("/") || req.body.name == "") {
                res.status(400);
                res.end("Invalid name");
                return;
            }

            db.run("INSERT INTO ctfs (name, description, start, end) VALUES (?, ?, ?, ?)", [req.body.name, req.body.description, req.body.start, req.body.end], function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        res.status(409);
                        res.end("ctf already exists");
                        return;
                    }
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                    throw err;
                }
                res.status(200);
                res.end("success");
                return;
            })
        }
    })

    router.post("/delete/:name", (req, res) => {
        // deletes a ctf
        if (req.check_auth("admin")) {
            db.run("DELETE FROM ctfs WHERE name = ?", [req.params.name], (err) => {
                if (err) {
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
    })

    router.post("/addMember/:ctfName", (req, res) => {
        // adds member to ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.params.ctfName;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                    return;
                }

                if (!row) {
                    res.status(404);
                    res.end("ctf not found");
                    return;
                }

                if (row.members == null) {
                    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [username, ctfName], (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500);
                            res.end("server error");
                            return;
                        }
                        console.log("added member to ctf");
                        res.status(200);
                        res.end("success");
                        return;
                    })
                    return;
                }

                console.log(row)
                let members = row.members.split(",");
                console.log(members);

                if (members.includes(username)) {
                    res.status(409);
                    res.end("user already in ctf");
                    return;
                }

                members.push(username);
                db.run("UPDATE ctfs SET members = ? WHERE name = ?", [members.join(","), ctfName], (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500);
                        res.end("server error");
                        return;
                    }
                    res.status(200);
                    res.end("success");
                    return;
                })
            })

        }
    })

    router.get("/list", (req, res) => {
        // lists all ctfs
        if (req.check_auth()) {
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

    router.get("/:name", (req, res) => {
        // gets info about a ctf
        if (req.check_auth()) {
            db.get("SELECT * FROM ctfs WHERE name = ?", [req.params.name], (err, row) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.end("server error");
                    return;
                }
                if (row == undefined) {
                    res.status(404);
                    res.end("ctf not found");
                    return;
                }
                if (row.members == null) {
                    row.members = [];
                }
                else {
                    row.members = row.members.split(",");
                }
                row.username = req.cookies.username;
                res.status(200);
                res.json(row);
                return;
            })
        }
    })

    return router;
}