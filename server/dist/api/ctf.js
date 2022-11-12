"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyLogin_1 = __importDefault(require("../utils/verifyLogin"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const db = new sqlite3_1.default.Database("ctf.db", (err) => {
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
    end DATE NOT NULL)`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Initialized ctfs table");
});
function ctf() {
    const router = (0, express_1.Router)();
    router.post("/ctfs/add", (req, res) => {
        // adds a new ctf
        if ((0, verifyLogin_1.default)(req.cookies.token)) {
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
                    return;
                }
                res.status(200);
                res.end("success");
                return;
            });
        }
        else {
            res.status(401);
            res.end("bad auth");
            return;
        }
    });
    router.get("/ctfs/list", (req, res) => {
        // lists all ctfs
        if ((0, verifyLogin_1.default)(req.cookies.token)) {
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
            });
        }
    });
    router.get("/ctf/:name", (req, res) => {
        // gets info about a ctf
        if ((0, verifyLogin_1.default)(req.cookies.token)) {
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
                res.status(200);
                res.json(row);
                return;
            });
        }
        else {
            res.status(401);
            res.end("bad auth");
            return;
        }
    });
    router.post("/ctfs/delete/:name", (req, res) => {
        // deletes a ctf
        if ((0, verifyLogin_1.default)(req.cookies.token)) {
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
            });
        }
        else {
            res.status(401);
            res.end("bad auth");
            return;
        }
    });
    return router;
}
exports.default = ctf;
