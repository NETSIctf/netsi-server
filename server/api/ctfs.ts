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

/*
  To add a new column to a table, add the column to the columns array.
  If the column has to be UNIQUE, you will have to reset the DB or manually add the UNIQUE constraint.
  If the column has the NOT NULL constraint, you will have to set a default value, manually add the constraint and fill the values, or reset the DB.
 */

function createCtfsTable() {
    // create ctfs table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS ctfs(id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE CHECK(length(name) < ${maxNameLength +1}))`);

    let alter: string = `ALTER TABLE ctfs ADD COLUMN`

    let columns: string[] = [
        `description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1})`,
        `start DATE NOT NULL DEFAULT (DATE('now'))`,
        `end DATE NOT NULL DEFAULT (DATE('now'))`,
        `members TEXT`
    ]

    for (let column of columns) {
        db.run(`${alter} ${column}`, (err) => {
            if (err) {
                if (err.message.includes("duplicate column name")) {
                    return;
                }
                console.error(err.message, column);
            }
        });
    }
}

function createChallengesTable() {
    // create challenges table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS challenges(id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL UNIQUE CHECK(length(name) < ${maxNameLength + 1}))`);

    let alter: string = `ALTER TABLE challenges ADD COLUMN`

    let columns = [
        `ctf_id INTEGER NOT NULL`,
        `description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1}) DEFAULT "default"`,
        `points INTEGER NOT NULL CHECK(points >= 0) DEFAULT 0`,
        `solved_by TEXT`
    ]

    for (let column of columns) {
        db.run(`${alter} ${column};`, (err) => {
            if (err) {
                if (err.message.includes("duplicate column name")) {
                    return;
                }
                console.error(err.message, column);
            }
            else {
                console.log("Added column", column);
            }
        });
    }

    // create foreign key
    db.run(`ALTER TABLE challenges ADD FOREIGN KEY (ctf_id) REFERENCES ctfs(id)`, () => {
        // ignore errors because the foreign key might already exist
    });
}

createCtfsTable();
createChallengesTable();

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

    function serverErr(err: Error | null, res: any) {
        // handle server errors
        if (err) {
            console.error(err);
            res.status(500)
            res.end("server error");
            return true;
        }

        return false;
    }

    function CTFNotFoundErr(row: any, res: any) {
        // handle ctf not found errors
        if (!row) {
            res.status(404);
            res.end("ctf not found");
            return true;
        }

        return false;
    }

    function challengeNotFoundErr(row: any, res: any) {
        // handle challenge not found errors
        if (!row) {
            res.status(404);
            res.end("challenge not found");
            return true;
        }

        return false;
    }

    function success(res: any) {
        // handle success
        res.status(200);
        res.end("success");
        return true;
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
                    else {
                        serverErr(err, res);
                        return;
                    }
                }
                success(res); return;
            })
        }
    })

    router.post("/delete/:name", (req, res) => {
        // deletes a ctf
        if (req.check_auth("admin")) {
            db.run("DELETE FROM ctfs WHERE name = ?", [req.params.name], (err) => {
                if (serverErr(err, res)) return;
                success(res); return;
            })
        }
    })

    router.post("/addMember/:ctfName", (req, res) => {
        // adds member to ctf
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.params.ctfName;
            db.get("SELECT members FROM ctfs WHERE name = ?", [ctfName], (err, row) => {
                if (serverErr(err, res)) return;
                if (CTFNotFoundErr(row, res)) return;

                if (row.members == null) {
                    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [username, ctfName], (err) => {
                        if (serverErr(err, res)) return;
                        console.log("added member to ctf");
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
                if (serverErr(err, res)) return;

                if (CTFNotFoundErr(row, res)) return;

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
                        serverErr(err, res);
                        return;
                    }
                    success(res); return;
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
                let [status, message] = updateMembers(members, ctfName);
                res.status(status);
                res.end(message);
            })
        }
    })

    router.post("/solveChal/:ctfName/:chalName", (req, res) => {
        // solves a challenge
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.params.ctfName;
            let chalName = req.params.chalName;

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

                db.run("UPDATE challenges SET solved_by = ? WHERE ctf_id = ? AND name = ?", [username, row.id, chalName], (err) => {
                    if (serverErr(err, res)) return;
                    success(res); return;
                })
            })
        }
    })

    router.post("/unsolveChal/:ctfName/:chalName", (req, res) => {
        // unsolves a challenge
        // I probably could've put both of these in one func but I wrote this afterwards and im lazy
        if (req.check_auth()) {
            let username = req.cookies.username;
            let ctfName = req.params.ctfName;
            let chalName = req.params.chalName;

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

                db.run("UPDATE challenges SET solved_by = NULL WHERE ctf_id = ? AND name = ?", [row.id, chalName], (err) => {
                    if (serverErr(err, res)) return;
                    success(res); return;
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

    router.get("/:name", (req, res) => {
        // gets info about a ctf
        if (req.check_auth()) {
            db.get("SELECT * FROM ctfs WHERE name = ?", [req.params.name], (err, row) => {
                if (serverErr(err, res)) return;
                if (CTFNotFoundErr(row, res)) return;

                if (row.members == null) {
                    row.members = [];
                }
                else {
                    row.members = row.members.split(",");
                }
                row.username = req.cookies.username;

                db.all("SELECT name, description, points, solved_by FROM challenges WHERE ctf_id = ?", [row.id], (err, rows) => {
                    console.log(rows);

                    if(serverErr(err, res)) return;

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