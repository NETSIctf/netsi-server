import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import checkLogin from "./checkLogin";

export default function Webshell() {
    const navigate = useNavigate();

    checkLogin();

    return (
        <div>
            waoow webshell
        </div>
    )
}