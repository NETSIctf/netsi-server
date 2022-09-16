import { useEffect, useRef } from "react";
import { checkLoginNavigate } from "./components/LoginChecks";
import Monitor from "./components/Monitor";
import "./scss/main.scss";

export default function Webshell() {
    checkLoginNavigate();

    return (
        <div>
            <Monitor />
        </div>
    )
}