"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * Sends an embed to the webhook
 *
 * @arg title Title of embed
 * @arg description Description of embed
 * @arg color https://www.spycolor.com/
 */
function webhookMessage(title, description, color) {
    if (process.env.NODE_ENV === "production") {
        const data = {
            embeds: [{
                    title: title,
                    description: description,
                    color: color
                }]
        };
        console.log(`WebhookMessage: ${title}/${description}`);
        axios_1.default.post(process.env.webhook_url, data);
    }
    else {
        console.log(`Simulated WebhookMessage: ${title}/${description}`);
    }
}
exports.default = webhookMessage;
