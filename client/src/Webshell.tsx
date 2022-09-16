import { useEffect } from "react";
import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

export default function Webshell() {
    checkLoginNavigate();

    return (
        <div>
            waoow webshell
        </div>
    )
}