import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authMiddleware(request: Request, response: Response, next: NextFunction) {
    response.auth_fail = () => auth_fail(response);
    request.check_auth = () => check_auth(request, response);

    next();
}

export function auth_fail(response: Response) {
    response.status(401);
    response.end("bad auth");
}

export function check_auth(a: Request, b: Response): boolean;
export function check_auth(a: string): boolean;
export function check_auth(a: Request | string, b?: Response): boolean {
    if (b && typeof a != "string") {
        var request = a, response = b;

        const token: string = request.cookies.token

        if (!token) {
            response.auth_fail();
            return false;
        }

        try {
            if (token && jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
                return true;
            }
        } catch (err) { }

        response.auth_fail();
        return false;
    } else if (typeof a == "string") {
        const token = a;

        if (!token) {
            return false;
        }

        try {
            if (jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] })) {
                return true;
            }
        } catch (err) { }

        return false;
    } else {
        throw new Error("check_auth(): Not sure how we got here, but we did.");
    }
}