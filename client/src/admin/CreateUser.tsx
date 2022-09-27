import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function CreateUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function createUser() {
        axios.post("/api/create", { username: username, password: password }).then(request => {
            if (request.status == 200) {
                alert(`Creation of ${username} successful`);
            }
        })
        .catch((err: AxiosError) => {
            if (err.response?.status == 409) {
                alert("Duplicate Username or Password");
            } else if (err.response?.status == 500) {
                alert("500 Internal Server Error");
            }
        })
    }

    return (
        <div className="d-flex flex-column" >
            <h2>Create new User:</h2>
            <div>
                <Form.Control type="text" placeholder="Username to create" value={username} onChange={e => setUsername(e.target.value)} />
                <Form.Control type="password" placeholder="Password to create" className="mt-2" value={password} onChange={e => setPassword(e.target.value)} />
                <Button className="mt-2" onClick={() => createUser()} >Create</Button>
            </div>
        </div>
    )
}