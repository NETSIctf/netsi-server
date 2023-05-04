"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = exports.pointsMustBeNumberErr = exports.pointsMustBeGreaterThanZeroErr = exports.descriptionTooLongErr = exports.nameTooLongErr = exports.challengeNotFoundErr = exports.CTFNotFoundErr = exports.serverErr = exports.updateMembers = void 0;
function updateMembers(members, ctfName, db) {
    /*
        update members in db
        args: members: string[], ctfName: string - members to update, ctf name
        returns: [number, string] - [status code, message]
    */
    let returnVal = [200, "success"];
    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [members.join(","), ctfName], (err) => {
        if (err) {
            console.error(err);
            returnVal = [500, "server error"];
            return;
        }
        returnVal = [200, "success"];
        return;
    });
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
        });
    }
    return returnVal;
}
exports.updateMembers = updateMembers;
function serverErr(err, res) {
    // handle server errors
    if (err) {
        console.error(err, res);
        res.status(500);
        res.end("server error");
        return true;
    }
    return false;
}
exports.serverErr = serverErr;
function CTFNotFoundErr(row, res) {
    // handle ctf not found errors
    if (!row) {
        res.status(404);
        res.end("ctf not found");
        return true;
    }
    return false;
}
exports.CTFNotFoundErr = CTFNotFoundErr;
function challengeNotFoundErr(row, res) {
    // handle challenge not found errors
    if (!row) {
        res.status(404);
        res.end("challenge not found");
        return true;
    }
    return false;
}
exports.challengeNotFoundErr = challengeNotFoundErr;
function nameTooLongErr(err, res) {
    if (!err)
        return false;
    const maxNameLength = 64;
    if (err.message == `SQLITE_CONSTRAINT: CHECK constraint failed: length(name) < ${maxNameLength + 1}`) {
        res.status(400);
        res.end(`Name cannot be greater than ${maxNameLength} characters`);
        return true;
    }
    return false;
}
exports.nameTooLongErr = nameTooLongErr;
function descriptionTooLongErr(err, res) {
    if (!err)
        return false;
    const maxDescriptionLength = 1024;
    if (err.message == `SQLITE_CONSTRAINT: CHECK constraint failed: length(description) < ${maxDescriptionLength + 1}`) {
        res.status(400);
        res.end(`Description cannot be greater than ${maxDescriptionLength} characters`);
        return true;
    }
    return false;
}
exports.descriptionTooLongErr = descriptionTooLongErr;
function pointsMustBeGreaterThanZeroErr(err, res) {
    if (!err)
        return false;
    if (err.message.includes(`SQLITE_CONSTRAINT: CHECK constraint failed: points >= 0`)) {
        res.status(400);
        res.end("Points must be greater or equal to 0");
        return true;
    }
    return false;
}
exports.pointsMustBeGreaterThanZeroErr = pointsMustBeGreaterThanZeroErr;
function pointsMustBeNumberErr(points, res) {
    try {
        parseInt(points);
    }
    catch (_a) {
        res.status(400);
        res.end("Points must be a number");
        return true;
    }
    return false;
}
exports.pointsMustBeNumberErr = pointsMustBeNumberErr;
function success(res) {
    // handle success
    res.status(200);
    res.end("success");
    return true;
}
exports.success = success;
