import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registerStatus, setRStatus] = useState(false);
    const [registerDup, setRDup] = useState(false);
    const navigate = useNavigate();

    function register() {
        setRStatus(true);
        setRDup(false);

        axios.post("/api/create", { username: username, password: password })
            .then(response => {
                setRStatus(false);

                if (response.status == 200) {
                    navigate("/login?new-user=true");
                }
            })
            .catch((err: AxiosError) => {
                if (err.response?.status == 409) {
                    setRDup(true);
                } else {
                    alert("Internal Server Error, Please try again");
                }
            })
    }

    return (
        <div>
            <h1 className="text-center">NETSI</h1>

            <div className={`d-flex flex-column justify-content-center align-items-center`} onKeyDown={e => e.key == "Enter" ? register() : null} >
                <div className={`bg-danger p-2 rounded d-${registerDup ? "block" : "none"}`} >
                    Nobody expected that someone else could have the same username as you, but they do.
                </div>

                <div className={`mt-2`} >
                    <h2>Register:</h2>
                </div>
                <div className={`mt-2`} >
                    <Form.Control type="text" placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} />
                </div>
                <div className={`mt-2`} >
                    <Form.Control type="password" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />
                </div>
                <div className={`mt-2`} >
                    <Button variant="primary" onClick={() => register()} >{registerStatus ? "Registering..." : "Register"}</Button>
                </div>
            </div>
        </div>
    )
}