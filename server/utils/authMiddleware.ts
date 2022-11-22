import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authMiddleware(request: Request, response: Response, next: NextFunction) {
    response.auth_fail = () => auth_fail(response);
    request.check_auth = (userOrAdmin: "user" | "admin") => check_auth(request, response, userOrAdmin);

    next();
}

export function auth_fail(response: Response) {
    response.status(401);
    response.end("bad auth");
}

export function check_auth(a: Request, b: Response, c?: "user" | "admin"): boolean;
export function check_auth(a: string, b?: "user" | "admin"): boolean;
export function check_auth(a: Request | string, b?: Response | "user" | "admin", c?: "user" | "admin"): boolean {
    if (typeof a != "string" && b && typeof b != "string") { // Middleware
        var request = a, response = b, userOrAdmin = c ? c : "user";

        const token: string = request.cookies.token;


        if (!token) {
            response.auth_fail();
            return false;
        }

        try {
            var auth: any = jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] });
            if (userOrAdmin == "admin") {
                if (auth.perms == "admin") {
                    return true;
                } else {
                    response.auth_fail();
                    return false;
                }
            } else {
                return true;
            }
        } catch (err) { }

        response.auth_fail();
        return false;
    } else if (typeof a == "string") { // string input method
        const token = a;
        const userOrAdmin = b ? b : "user";

        if (!token) {
            return false;
        }

        try {
            var auth: any = jwt.verify(token, process.env.jwt_secret + "", { algorithms: ["HS256"] });
            if (userOrAdmin == "admin") {
                if (auth.perms == "admin") {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } catch (err) { }

        return false;
    } else {
        throw new Error("check_auth(): Not sure how we got here, but we did.");
    }
}