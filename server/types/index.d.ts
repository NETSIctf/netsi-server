import { auth_failT, check_authT } from "../utils/authMiddleware";

declare global {
}

declare module 'express-serve-static-core' {
    interface Request {
        check_auth: check_authT
    }
    interface Response {
        auth_fail: auth_failT
    }
}