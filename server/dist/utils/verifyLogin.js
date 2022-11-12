"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyLogin(token) {
    try {
        if (token && jsonwebtoken_1.default.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
            return true;
        }
    }
    catch (err) {
        return false;
    }
}
exports.default = verifyLogin;
