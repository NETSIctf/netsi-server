"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oldLog = console.log.bind(console);
console.log = (message, ...optionalParams) => {
    oldLog(`[${new Date().toUTCString()}]`, message, ...optionalParams);
};
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const node_fs_1 = __importDefault(require("node:fs"));
const morgan_1 = __importDefault(require("morgan"));
const webhookMessage_js_1 = __importDefault(require("./utils/webhookMessage.js"));
const WSocket_js_1 = __importDefault(require("./utils/WSocket.js"));
const api_1 = __importDefault(require("./api"));
const authMiddleware_js_1 = __importDefault(require("./utils/authMiddleware.js"));
// Init
const socketManager = new WSocket_js_1.default();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Request Body/Cookies
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((request, response, next) => {
    if (process.env.NODE_ENV == "production" && !request.secure) {
        return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
});
app.use(authMiddleware_js_1.default); // Auth Util Functions
var accessLogStream = node_fs_1.default.createWriteStream('access.log', { flags: 'a' }); // logging
app.use((0, morgan_1.default)("combined", { stream: accessLogStream }));
// routes
app.use("/api", (0, api_1.default)(socketManager)); // ALL apis
app.use("/assets", express_1.default.static("../client/dist/assets/")); // production files
app.get("/favicon.png", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../client/dist/favicon.png"));
});
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../client/dist/index.html"));
});
// Server creation 
if (process.env.NODE_ENV == "production") {
    const options = {
        key: node_fs_1.default.readFileSync('/etc/letsencrypt/live/netsi.tk/privkey.pem'),
        cert: node_fs_1.default.readFileSync('/etc/letsencrypt/live/netsi.tk/fullchain.pem')
    };
    http_1.default.createServer(app).listen(80);
    let server = https_1.default.createServer(options, app).listen(443);
    socketManager.attach(server);
    (0, webhookMessage_js_1.default)("Server is online", "Server is online, listening at `netsi.tk`!", 65280);
}
else {
    let server = http_1.default.createServer(app).listen(PORT);
    socketManager.attach(server);
    console.log(`Server listening on port ${PORT}`);
}
process.on('uncaughtException', function (err) {
    console.error(err.stack);
    var errorMessage = err.stack + "";
    if (!err.stack) {
        errorMessage = "No error stack found... weird.";
    }
    (0, webhookMessage_js_1.default)("Server Error!", errorMessage, 16711680);
});
