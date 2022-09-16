import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkLogin } from "./components/LoginChecks";
import "./scss/main.scss";

export default function Webshell() {
    const navigate = useNavigate();

    useEffect(() => { // runs on first render
        checkLogin();
    }, [])

    return (
        <div>
            waoow webshell
        </div>
    )
}