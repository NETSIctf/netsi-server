import express from "express";

import userApi from "./api/user";
import monitorApi from "./api/monitor";
import ctfRouter from "./api/ctfs";
import WSocket from "./utils/WSocket";

export default function apis(socketManager: WSocket) {
    // API ROUTES
    const router = express.Router();

    userApi(router);
    monitorApi(router, socketManager);

    router.use("/ctfs", ctfRouter());

    router.get("/status", (req, res) => {
        res.status(200);
        res.end("pong");
    });

    return router;
}