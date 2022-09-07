import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import "./scss/main.scss";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    axios.post("/api/login", {username: username, password: password})
      .then(resolve => {
      }).catch(reject => {
        console.error(reject);
      })
  }

  return (
    <div>
      <h1 className="text-center">NETSI</h1>

      <div className={`d-flex flex-column justify-content-center align-items-center`} >
        <div className={`mt-2`} >
          <h2>Login:</h2>
        </div>
        <div className={`mt-2`} >
          <Form.Control type="text" placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} />
        </div>
        <div className={`mt-2`} >
          <Form.Control type="password" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <div className={`mt-2`} >
          <Button variant="primary" onClick={() => login()} >Login</Button>
        </div>
      </div>
    </div>
  )
}

export default App
