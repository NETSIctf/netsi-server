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
    }, [])

    return (
        <div>
            waow webshell test push
        </div>
    )
}