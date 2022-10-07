import { Router } from "express";

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("ctf.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});

const maxNameLength = 64;
const maxDescriptionLength = 1024;

// create ctfs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS ctfs( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE CHECK(length(name) < ${maxNameLength + 1}),
    description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1}),
    start DATE NOT NULL,
    end DATE NOT NULL,
    members TEXT)`,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Initialized ctf DB");
    }
);

// add challenges table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS challenges(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ctf_id INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE CHECK(length(name) < ${maxNameLength + 1}),
    description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1}),
    points INTEGER NOT NULL CHECK(points >= 0),
    solved_by TEXT,
    FOREIGN KEY (ctf_id) REFERENCES ctfs(id))`,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Initialized challenges DB");
    }
);

export default function ctf() {
    const router = Router();

    function updateMembers(members:string[], ctfName: string): [number, string]{
        /*
            update members in db
            args: members: string[], ctfName: string - members to update, ctf name
            returns: [number, string] - [status code, message]
        */

        let returnVal: [number, string] = [200, "success"];
        db.run("UPDATE ctfs SET members = ? WHERE name = ?", [members.join(","), ctfName], (err) => {
            if (err) {
                console.error(err);
                returnVal = [500, "server error"];
                return;
            }
            returnVal = [200, "success"];
            return;
        })

        // if members are empty, set members to null
        if (members.length === 0) {
            db.run("UPDATE ctfs SET members = ? WHERE name = ?", [null, ctfName], (err) => {
                if (err) {
                    console.error(err);
                    returnVal = [500, "server error"];
                    return;
                }
                returnVal = [200, "success"];
                return;
            })
        }

        return returnVal;
    }

    router.post("/add", (req, res) => {
        // adds a new ctf
        if (req.check_auth("admin")) {
            db.run("INSERT INTO ctfs (name, description, start, end) VALUES (?, ?, ?, ?)", [req.body.name, req.body.description, req.body.start, req.body.end], function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        res.status(409);
                        res.end("ctf already exists");
                        return;
                    }
                    else if (err.message.includes(`CHECK constraint failed: length(name) < ${maxNameLength + 1}`)) {
                        res.status(400);
                        res.end(`Name too long, max ${maxNameLength} characters`);
                        return;
                    }
                    else if (err.message.includes(`CHECK constraint failed: length(description) < ${maxDescriptionLength + 1}`)) {
                        res.status(400);
                        res.end(`Description too long, max ${maxDescriptionLength} characters`);
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

                let members = row.members.split(",");

                if (members.includes(username)) {
                    res.status(409);
                    res.end("user already in ctf");
                    return;
                }

                members.push(username);
                let [status, message] = updateMembers(members, ctfName);
                res.status(status);
                res.end(message);
            })

        }
    })

    router.post("/addChallenge/:ctfName", (req, res) => {
        if (req.check_auth()) {
            let ctfName = req.params.ctfName;
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
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
                if (req.body.points.match(/^[0-9]+$/) == null) {
                    res.status(400);
                    res.end("invalid points, must be a number");
                    return;
                }
                db.run("INSERT INTO challenges (ctf_id, name, description, points) VALUES (?, ?, ?, ?)", [row.id, req.body.name, req.body.description, req.body.points], (err) => {
                    if (err) {
                        if (err.message.includes(`CHECK constraint failed: length(name) < ${maxNameLength + 1}`)) {
                            res.status(400);
                            res.end(`Name too long, max ${maxNameLength} characters`);
                            return;
                        } else if (err.message.includes(`CHECK constraint failed: length(description) < ${maxDescriptionLength + 1}`)) {
                            res.status(400);
                            res.end(`Description too long, max ${maxDescriptionLength} characters`);
                            return;
                        } else if (err.message.includes(`CHECK constraint failed: points >= 0`)) {
                            res.status(400);
                            res.end("Points must be greater or equal to 0");
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
            })
        }
    })


    router.post("/removeMember/:ctfName", (req, res) => {
        // removes member from ctf
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
                    res.status(404);
                    res.end("user not in ctf");
                    return;
                }

                let members = row.members.split(",");

                if (!members.includes(username)) {
                    res.status(404);
                    res.end("user not in ctf");
                    return;
                }

                members.splice(members.indexOf(username), 1);
                let [status, message] = updateMembers(members, ctfName);
                res.status(status);
                res.end(message);
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

                db.all("SELECT name, description, points, solved_by FROM challenges WHERE ctf_id = ?", [row.id], (err, rows) => {
                    console.log(rows);

                    if (err) {
                        console.error(err);
                        res.status(500);
                        res.end("server error");
                        return;
                    }

                    if (rows == undefined) {
                        row.challenges = [];
                    }
                    else {
                        row.challenges = rows;
                    }

                    res.status(200);
                    res.json(row);
                    return;
                })
            })
        }
    })

    return router;
}