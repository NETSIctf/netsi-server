import { checkLoginNavigate } from "../components/LoginChecks"
import CreateUser from "./CreateUser";

export default function Admin() {
    checkLoginNavigate();

    return (
        <div className="m-2 ms-4 flex-column text-center align-items-center" >
            <h1>Admin Panel</h1>

            <div className="d-flex w-100" >
                <CreateUser />
            </div>
        </div>
    )
}