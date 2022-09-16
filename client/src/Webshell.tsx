import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

export default function Webshell() {
    const navigate = useNavigate();

    useEffect(() => { // runs on first render
        checkLoginNavigate();
    }, [])

    return (
        <div>
            waoow webshell
        </div>
    )
}