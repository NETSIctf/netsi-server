import { checkLoginNavigate } from "../components/LoginChecks";
import Monitor from "./Monitor";

export default function Webshell() {
    checkLoginNavigate();

    return (
        <div>
            <Monitor />
        </div>
    )
}