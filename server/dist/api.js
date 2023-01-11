"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./api/user"));
const monitor_1 = __importDefault(require("./api/monitor"));
const ctfs_1 = __importDefault(require("./api/ctfs/ctfs"));
function apis(socketManager) {
    // API ROUTES
    const router = express_1.default.Router();
    (0, user_1.default)(router);
    (0, monitor_1.default)(router, socketManager);
    router.use("/ctfs", (0, ctfs_1.default)());
    router.get("/status", (req, res) => {
        res.status(200);
        res.end("NETSI API is running");
    });
    return router;
}
exports.default = apis;
