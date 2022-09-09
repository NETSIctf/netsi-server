import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Webshell() {
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/login")
            .then(resolve => {
                if (resolve.status === 401) {
                    navigate("/");
                }
            })

        const ws = new WebSocket("ws://" + location.hostname + ":4001")

        ws.addEventListener('open', () => {
            console.log("Connected")
        })
        
        ws.addEventListener('message', (data) => {
            console.log(data.data)
        })
    }, [])

    return (
        <div>
            waoow webshell
        </div>
    )
}