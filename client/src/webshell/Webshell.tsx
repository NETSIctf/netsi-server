import { Route, Routes } from "react-router-dom";
import { checkLoginNavigate } from "../components/LoginChecks";
import Monitor from "./Monitor";

export default function Webshell() {
    checkLoginNavigate();

    return (
        <div className="flex-grow-1" >
            <Routes>
                <Route index element={<Monitor />} />
            </Routes>
        </div>
    )
}