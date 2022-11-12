import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export function verifyLogin(token) {
    try {
        if (token && jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
            return true;
        }
    }
    catch (err) {
        return false;
    }
}
