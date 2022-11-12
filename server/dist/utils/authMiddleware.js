"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check_auth = exports.auth_fail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(request, response, next) {
    response.auth_fail = () => auth_fail(response);
    request.check_auth = (userOrAdmin) => check_auth(request, response, userOrAdmin);
    next();
}
exports.default = authMiddleware;
function auth_fail(response) {
    response.status(401);
    response.end("bad auth");
}
exports.auth_fail = auth_fail;
function check_auth(a, b, c) {
    if (typeof a != "string" && b && typeof b != "string") { // Middleware
        var request = a, response = b, userOrAdmin = c ? c : "user";
        const token = request.cookies.token;
        if (!token) {
            response.auth_fail();
            return false;
        }
        try {
            var auth = jsonwebtoken_1.default.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] });
            if (userOrAdmin == "admin") {
                if (auth.perms == "admin") {
                    return true;
                }
                else {
                    response.auth_fail();
                    return false;
                }
            }
            else {
                return true;
            }
        }
        catch (err) { }
        response.auth_fail();
        return false;
    }
    else if (typeof a == "string") { // string input method
        const token = a;
        const userOrAdmin = b ? b : "user";
        if (!token) {
            return false;
        }
        try {
            var auth = jsonwebtoken_1.default.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] });
            if (userOrAdmin == "admin") {
                if (auth.perms == "admin") {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return true;
            }
        }
        catch (err) { }
        return false;
    }
    else {
        throw new Error("check_auth(): Not sure how we got here, but we did.");
    }
}
exports.check_auth = check_auth;
