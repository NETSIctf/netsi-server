import axios from "axios";
/**
 * Sends an embed to the webhook
 * 
 * @arg title Title of embed
 * @arg description Description of embed
 * @arg color https://www.spycolor.com/
 */

export default function webhookMessage(title: String, description: String, color: number) {
    if (process.env.NODE_ENV === "production") {
        const data = {
            embeds: [{
                title: title,
                description: description,
                color: color
            }]
        }
    
        console.log(`WebhookMessage: ${title}/${description}`);
        axios.post(process.env.webhook_url as string, data)
    } else {
        console.log(`Simulated WebhookMessage: ${title}/${description}`)
    }
}