import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import "./scss/main.scss";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFail, setLoginFail] = useState(false);
  const navigate = useNavigate();

  function login() {
    console.log(sessionStorage.getItem("token"));
    axios.post("/api/login", { username: username, password: password })
      .then(resolve => {
        if (resolve.status == 401) { // probably not needed
          setLoginFail(true);
        } else {
          navigate("/");
        }
      }).catch(reject => {
        if (reject.response.data == "bad auth") {
          setLoginFail(true);
        }
        else {
          console.error(reject);
        }
      })
  }

  axios.get("/api/login").then(resolve => {
    if (resolve.status === 200) {
        navigate("/");
    }
  }).catch()


  return (
    <div>
      <h1 className="text-center">NETSI</h1>

      <div className={`d-flex flex-column justify-content-center align-items-center`} >
        <div className={`bg-danger p-2 rounded d-${loginFail ? "block" : "none"}`} >
          Bad Username or Password
        </div>

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

export default Login
