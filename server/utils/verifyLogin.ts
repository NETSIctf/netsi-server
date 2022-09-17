import jwt from "jsonwebtoken";

export default function verifyLogin(token: string | undefined) {
    try {
        if (token && jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
            return true;
        }
    } catch(err) {
        return false;
    }
}