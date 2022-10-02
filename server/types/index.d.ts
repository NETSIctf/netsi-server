import { auth_fail, check_auth } from "../utils/authMiddleware";

declare global {
}

declare module 'express-serve-static-core' {
    interface Request {
        check_auth: check_auth
    }
    interface Response {
        auth_fail: auth_fail
    }
}