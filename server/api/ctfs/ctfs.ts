import { Router } from "express";
import sqlite3 from "sqlite3";

import createTables from "./createTables";
import { updateMembers, serverErr, CTFNotFoundErr, challengeNotFoundErr, success } from "./utils";

const db = new sqlite3.Database("ctf.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});

const maxNameLength = 64;
const maxDescriptionLength = 1024;

createTables("all");

export default function ctf() {
    const router = Router();

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
                    else {
                        serverErr(err, res);
                        return;
                    }
                }
                success(res); return;
            })
        }
        else {
            res.status(401);
            res.end("bad auth");
        }
    })

    router.post("/delete", (req, res) => {
        // deletes a ctf
        if (req.check_auth("admin")) {
            db.run("DELETE FROM ctfs WHERE name = ?", [req.body.title as string], (err) => {
                if (serverErr(err, res)) return;
                success(res); return;
            })
        }
    })

    router.post("/addMember", (req, res) => {
        // adds member to ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title as string;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;
                if (CTFNotFoundErr(row, res)) return;

                if (row.members == null) {
                    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [username, ctfName], (err) => {
                        if (serverErr(err, res)) return;
                        success(res); return;
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
                let [status, message] = updateMembers(members, ctfName, db);
                res.status(status);
                res.end(message);
            })

        }
    })

    router.post("/addChallenge", (req, res) => {
        if (req.check_auth()) {
            let ctfName = req.body.title as string;
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;

                if (CTFNotFoundErr(row, res)) return;

                if (req.body.points.match(/^[0-9]+$/) == null) {
                    res.status(400);
                    res.end("invalid points, must be a number");
                    return;
                }

                db.get(`SELECT id FROM challenges WHERE name = ? AND ctf_id = ?`, [req.body.name, row.id], (err, ids) => {
                    if (serverErr(err, res)) return;

                    if (ids) {
                        res.status(409);
                        res.end("challenge already exists");
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
                            serverErr(err, res);
                            return;
                        }

                        success(res); return;
                    })
                });
            })
        }
    })

    router.post("/removeMember", (req, res) => {
        // removes member from ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title as string;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;

                if (CTFNotFoundErr(row, res)) return;

                if (!row.members) {
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
                let [status, message] = updateMembers(members, ctfName, db);
                res.status(status);
                res.end(message);
            })
        }
    })

    router.post("/solveChal", (req, res) => {
        // solves a challenge
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title as string;
            let chalName = req.body.chalTitle as string;
            let flag = req.body.flag as string;

            if (flag.length <= 0) {
                res.status(400);
                res.end("Provide a flag");
                return;
            }

            db.get("SELECT id, members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;

                if (CTFNotFoundErr(row, res)) return;

                // do not mark as solved if the user is not in ctf
                if (!row.members || !row.members.split(",").includes(username)) {
                    res.status(403);
                    res.end("You must be in the ctf to solve challenges");
                    return;
                }

                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [row.id, chalName], (err, row) => {
                    if (serverErr(err, res)) return;

                    if (challengeNotFoundErr(row, res)) return;
                })

                db.run("UPDATE challenges SET solved_by = ?, flag = ? WHERE ctf_id = ? AND name = ?", [username, flag, row.id, chalName], (err) => {
                    if (serverErr(err, res)) return;
                    success(res); return;
                })
            })
        }
    })

    router.post("/unsolveChal", (req, res) => {
        // unsolves a challenge
        // I probably could've put both of these in one func but I wrote this afterwards and im lazy
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title as string;
            let chalName = req.body.chalTitle as string;

            db.get("SELECT id, members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;

                if (CTFNotFoundErr(row, res)) return;

                db.get("SELECT solved_by FROM challenges WHERE ctf_id = ? AND name = ?", [row.id, chalName], (err, row) => {
                    if (serverErr(err, res)) return;

                    if (challengeNotFoundErr(row, res)) return;

                    if (row.solved_by != username && !req.check_auth("admin")) {
                        res.status(403);
                        res.end("You did not solve this challenge and you are not an admin");
                        return;
                    }
                })

                db.run("UPDATE challenges SET solved_by = NULL, flag = NULL WHERE ctf_id = ? AND name = ?", [row.id, chalName], (err) => {
                    if (serverErr(err, res)) return;
                    success(res); return;
                })
            })
        }
    })

    router.post("/deleteChal", (req, res) => {
        // deletes a challenge if you are an admin
        if (req.check_auth("admin")) {
            let ctfName = req.body.title as string;
            let chalName = req.body.chalTitle as string;

            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (CTFNotFoundErr(ctfID, res)) return;

                if (serverErr(err, res)) return;

                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, chalName], (err, challengeID) => {
                    if (challengeNotFoundErr(challengeID, res)) return;

                    if (serverErr(err, res)) return;

                    db.run("DELETE FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, chalName], (err) => {
                        if (serverErr(err, res)) return;

                        success(res); return;
                    })
                })

            })
        }
    })

    router.get("/list", (req, res) => {
        // lists all ctfs
        if (req.check_auth()) {
            db.all("SELECT name FROM ctfs", [], (err, rows) => {
                if (serverErr(err, res)) return;
                res.status(200);
                res.json(rows);
                return;
            })
        }
    })

    router.get("/view", (req, res) => {
        // gets info about a ctf
        let ctfName = decodeURIComponent(req.query.title as string);
        if (req.check_auth()) {
            db.get("SELECT * FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;
                if (CTFNotFoundErr(row, res)) return;

                if (row.members == null) {
                    row.members = [];
                }
                else {
                    row.members = row.members.split(",");
                }
                row.username = req.cookies.username;

                db.all("SELECT name, description, points, flag, solved_by FROM challenges WHERE ctf_id = ?", [row.id], (err, rows) => {
                    if(serverErr(err, res)) return;

                    if (rows == undefined) {
                        row.challenges = [];
                    } else {
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