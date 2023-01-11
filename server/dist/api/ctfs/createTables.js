"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const db = new sqlite3_1.default.Database("ctf.db", (err) => {
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
function createTables(table) {
    function createCtfsTable() {
        // create ctfs table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS ctfs(id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE CHECK(length(name) < ${maxNameLength + 1}))`);
        let alter = `ALTER TABLE ctfs ADD COLUMN`;
        let columns = [
            `description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1})`,
            `start DATE NOT NULL DEFAULT (DATE('now'))`,
            `end DATE NOT NULL DEFAULT (DATE('now'))`,
            `members TEXT`
        ];
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
        console.log("Initialized ctfs table");
    }
    function createChallengesTable() {
        // create challenges table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS challenges(id INTEGER PRIMARY KEY AUTOINCREMENT)`);
        let alter = `ALTER TABLE challenges ADD COLUMN`;
        let columns = [
            `name TEXT NOT NULL CHECK(length(name) < ${maxNameLength + 1})`,
            `ctf_id INTEGER NOT NULL`,
            `description TEXT NOT NULL CHECK(length(description) < ${maxDescriptionLength + 1}) DEFAULT "default"`,
            `points INTEGER NOT NULL CHECK(points >= 0) DEFAULT 0`,
            `solved_by TEXT`,
            `flag TEXT`,
            `writeup TEXT NOT NULL DEFAULT "default"`,
        ];
        for (let column of columns) {
            db.run(`${alter} ${column};`, (err) => {
                if (err) {
                    if (err.message.includes("duplicate column name")) {
                        return;
                    }
                    console.error(err.message, column);
                }
            });
        }
        // create foreign key
        db.run(`ALTER TABLE challenges ADD FOREIGN KEY (ctf_id) REFERENCES ctfs(id)`, () => {
            // ignore errors because the foreign key might already exist
        });
        console.log("Initialized challenges table");
    }
    switch (String(table)) {
        case "ctfs":
            createCtfsTable();
            break;
        case "challenges":
            createChallengesTable();
            break;
        case "all":
            createCtfsTable();
            createChallengesTable();
            break;
        default:
            console.error("Invalid table name");
    }
}
exports.default = createTables;
