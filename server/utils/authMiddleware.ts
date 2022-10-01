import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type auth_failT = () => void;
export type check_authT = () => boolean;

export default function authMiddleware(request: Request, response: Response, next: NextFunction) {
    response.auth_fail = function () {
        response.status(401);
        response.end("bad auth");
    }

    request.check_auth = function() {
        const token: string = request.cookies.token

        if (!token) {
            response.auth_fail();
            return false;
        }

        try {
            if (token && jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
                return true;
            }
        } catch(err) {}

        response.auth_fail();
        return false;
    }

    next();
}