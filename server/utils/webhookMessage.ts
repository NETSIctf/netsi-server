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
        axios.post("https://discord.com/api/webhooks/1016905904093925406/hQpKUm3elqbBKw7XIipjcODkVtwshuOiDfbORhGNIUUe9OwTRpqCp24Pv5UI0NVU9Giv", data)
    } else {
        console.log(`Simulated WebhookMessage: ${title}/${description}`)
    }
}