"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sqlite3_1 = __importDefault(require("sqlite3"));
const createTables_1 = __importDefault(require("./createTables"));
const utils = __importStar(require("./utils"));
const utils_1 = require("./utils");
const db = new sqlite3_1.default.Database("ctf.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});
(0, createTables_1.default)("all");
function ctf() {
    const router = (0, express_1.Router)();
    router.post("/add", (req, res) => {
        // adds a new ctf
        if (req.check_auth("admin")) {
            // if the start is before the end, return error
            if (req.body.start > req.body.end) {
                res.status(400);
                res.end("start date must be before end date. Are you trying to time travel?");
                return;
            }
            db.run("INSERT INTO ctfs (name, description, start, end) VALUES (?, ?, ?, ?)", [req.body.name, req.body.description, req.body.start, req.body.end], function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        res.status(409);
                        res.end("CTF already exists");
                        return;
                    }
                    if (utils.nameTooLongErr(err, res))
                        return;
                    if (utils.descriptionTooLongErr(err, res))
                        return;
                    utils.serverErr(err, res);
                    return;
                }
                utils.success(res);
                return;
            });
        }
        else {
            res.status(401);
            res.end("bad auth");
        }
    });
    router.post("/delete", (req, res) => {
        // deletes a ctf
        if (req.check_auth("admin")) {
            let ctfName = req.body.title;
            // delete challenges in the ctf
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.run("DELETE FROM challenges WHERE ctf_id = ?", [ctfID.id], (err) => {
                    if (utils.serverErr(err, res))
                        return;
                });
            });
            // delete the ctf
            db.run("DELETE FROM ctfs WHERE name = ?", [ctfName], (err) => {
                if (utils.serverErr(err, res))
                    return;
                utils.success(res);
                return;
            });
        }
    });
    router.post("/addMember", (req, res) => {
        // adds member to ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
                if (row.members == null) {
                    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [username, ctfName], (err) => {
                        if (utils.serverErr(err, res))
                            return;
                        utils.success(res);
                        return;
                    });
                    return;
                }
                let members = row.members.split(",");
                if (members.includes(username)) {
                    res.status(409);
                    res.end("user already in ctf");
                    return;
                }
                members.push(username);
                let [status, message] = utils.updateMembers(members, ctfName, db);
                res.status(status);
                res.end(message);
            });
        }
    });
    router.post("/addChallenge", (req, res) => {
        if (req.check_auth()) {
            let ctfName = req.body.title;
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
                if ((0, utils_1.pointsMustBeNumberErr)(req.body.points, res))
                    return;
                db.get(`SELECT id FROM challenges WHERE name = ? AND ctf_id = ?`, [req.body.name, row.id], (err, ids) => {
                    if (ids) {
                        res.status(409);
                        res.end("challenge already exists");
                        return;
                    }
                    if (utils.serverErr(err, res))
                        return;
                    let writeup = `# ${ctfName} - ${req.body.name}`;
                    db.run("INSERT INTO challenges (ctf_id, name, description, points, writeup) VALUES (?, ?, ?, ?, ?)", [row.id, req.body.name, req.body.description, req.body.points, writeup], (err) => {
                        if (utils.nameTooLongErr(err, res))
                            return;
                        if (utils.descriptionTooLongErr(err, res))
                            return;
                        if (utils.pointsMustBeGreaterThanZeroErr(err, res))
                            return;
                        if (utils.serverErr(err, res))
                            return;
                        utils.success(res);
                        return;
                    });
                });
            });
        }
    });
    router.post("/removeMember", (req, res) => {
        // removes member from ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
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
                let [status, message] = utils.updateMembers(members, ctfName, db);
                res.status(status);
                res.end(message);
            });
        }
    });
    router.post("/solveChallenge", (req, res) => {
        // solves a challenge
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title;
            let challenge = req.body.challengeTitle;
            let flag = req.body.flag;
            if (flag.length <= 0) {
                res.status(400);
                res.end("Provide a flag");
                return;
            }
            db.get("SELECT id, members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
                // do not mark as solved if the user is not in ctf
                if (!row.members || !row.members.split(",").includes(username)) {
                    res.status(403);
                    res.end("You must be in the ctf to solve challenges");
                    return;
                }
                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [row.id, challenge], (err, row) => {
                    if (utils.serverErr(err, res))
                        return;
                    if (utils.challengeNotFoundErr(row, res))
                        return;
                });
                db.run("UPDATE challenges SET solved_by = ?, flag = ? WHERE ctf_id = ? AND name = ?", [username, flag, row.id, challenge], (err) => {
                    if (utils.serverErr(err, res))
                        return;
                    utils.success(res);
                    return;
                });
            });
        }
    });
    router.post("/unsolveChallenge", (req, res) => {
        // unsolves a challenge
        // I probably could've put both of these in one func, but I wrote this afterwards and im lazy
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.body.title;
            let challengeName = req.body.chalTitle;
            db.get("SELECT id, members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
                db.get("SELECT solved_by FROM challenges WHERE ctf_id = ? AND name = ?", [row.id, challengeName], (err, row) => {
                    if (utils.serverErr(err, res))
                        return;
                    if (utils.challengeNotFoundErr(row, res))
                        return;
                    if (row.solved_by != username && !req.check_auth("admin")) {
                        res.status(403);
                        res.end("You did not solve this challenge and you are not an admin");
                        return;
                    }
                });
                db.run("UPDATE challenges SET solved_by = NULL, flag = NULL WHERE ctf_id = ? AND name = ?", [row.id, challengeName], (err) => {
                    if (utils.serverErr(err, res))
                        return;
                    utils.success(res);
                    return;
                });
            });
        }
    });
    router.post("/deleteChallenge", (req, res) => {
        // deletes a challenge if you are an admin
        if (req.check_auth("admin")) {
            let ctfName = req.body.title;
            let challengeName = req.body.challengeTitle;
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, challengeName], (err, challengeID) => {
                    if (utils.challengeNotFoundErr(challengeID, res))
                        return;
                    if (utils.serverErr(err, res))
                        return;
                    db.run("DELETE FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, challengeName], (err) => {
                        if (utils.serverErr(err, res))
                            return;
                        utils.success(res);
                        return;
                    });
                });
            });
        }
    });
    router.post("/updateWriteup", (req, res) => {
        // updates the writeup for a challenge
        if (req.check_auth("admin")) {
            let ctfName = req.body.title;
            let challengeName = req.body.challengeTitle;
            let writeup = req.body.writeup;
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, challengeName], (err, challengeID) => {
                    if (utils.challengeNotFoundErr(challengeID, res))
                        return;
                    if (utils.serverErr(err, res))
                        return;
                    db.run("UPDATE challenges SET writeup = ? WHERE ctf_id = ? AND name = ?", [writeup, ctfID.id, challengeName], (err) => {
                        if (utils.serverErr(err, res))
                            return;
                        utils.success(res);
                        return;
                    });
                });
            });
        }
        else {
            res.status(403);
            res.end("You are not an admin");
            return;
        }
    });
    router.post("/editChallenge", (req, res) => {
        // updates a challenge
        if (req.check_auth("admin")) {
            if (utils.pointsMustBeNumberErr(req.body.points, res))
                return;
            db.get("SELECT id FROM ctfs WHERE name = ?", [req.body.title], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, req.body.old_name], (err, challengeID) => {
                    if (utils.challengeNotFoundErr(challengeID, res))
                        return;
                    if (utils.serverErr(err, res))
                        return;
                    // if the name is being changed, check if the new name is taken
                    if (req.body.old_name != req.body.name) {
                        db.get("SELECT id FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, req.body.name], (err, row) => {
                            if (row) {
                                res.status(409);
                                res.end("That challenge name is already taken");
                                return;
                            }
                            if (utils.serverErr(err, res))
                                return;
                        });
                    }
                    db.run("UPDATE challenges SET name = ?, description = ?, points = ? WHERE id = ?", [req.body.name, req.body.description, req.body.points, challengeID.id], (err) => {
                        if (utils.nameTooLongErr(err, res))
                            return;
                        if (utils.descriptionTooLongErr(err, res))
                            return;
                        if (utils.pointsMustBeGreaterThanZeroErr(err, res))
                            return;
                        if (utils.serverErr(err, res))
                            return;
                        utils.success(res);
                        return;
                    });
                });
            });
        }
    });
    router.get("/list", (req, res) => {
        // lists all ctfs
        if (req.check_auth()) {
            db.all("SELECT name FROM ctfs", [], (err, rows) => {
                if (utils.serverErr(err, res))
                    return;
                res.status(200);
                res.json(rows);
                return;
            });
        }
    });
    router.get("/view", (req, res) => {
        // gets info about a ctf
        let ctfName = decodeURIComponent(req.query.title);
        if (req.check_auth()) {
            db.get("SELECT * FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (utils.serverErr(err, res))
                    return;
                if (utils.CTFNotFoundErr(row, res))
                    return;
                if (row.members == null) {
                    row.members = [];
                }
                else {
                    row.members = row.members.split(",");
                }
                row.username = req.cookies.username;
                db.all("SELECT name, description, points, flag, solved_by FROM challenges WHERE ctf_id = ?", [row.id], (err, rows) => {
                    if (utils.serverErr(err, res))
                        return;
                    if (rows == undefined) {
                        row.challenges = [];
                    }
                    else {
                        row.challenges = rows;
                    }
                    res.status(200);
                    res.json(row);
                    return;
                });
            });
        }
    });
    router.get("/writeup", (req, res) => {
        // get the writeup for a challenge
        if (req.check_auth()) {
            let ctfName = decodeURIComponent(req.query.title);
            let chalName = decodeURIComponent(req.query.challenge);
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.get("SELECT writeup FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, chalName], (err, row) => {
                    if (utils.challengeNotFoundErr(row, res))
                        return;
                    if (utils.serverErr(err, res))
                        return;
                    res.status(200);
                    res.json(row);
                    return;
                });
            });
        }
    });
    router.get("/editChallenge", (req, res) => {
        // gets basic info about a challenge for editing
        if (req.check_auth("admin")) {
            let ctfName = decodeURIComponent(req.query.title);
            let challengeName = decodeURIComponent(req.query.name);
            db.get("SELECT id FROM ctfs WHERE name = ?", [ctfName], (err, ctfID) => {
                if (utils.CTFNotFoundErr(ctfID, res))
                    return;
                if (utils.serverErr(err, res))
                    return;
                db.get("SELECT name, description, points FROM challenges WHERE ctf_id = ? AND name = ?", [ctfID.id, challengeName], (err, row) => {
                    if (utils.challengeNotFoundErr(row, res))
                        return;
                    if (utils.serverErr(err, res))
                        return;
                    res.status(200);
                    res.json(row);
                    return;
                });
            });
        }
    });
    return router;
}
exports.default = ctf;
