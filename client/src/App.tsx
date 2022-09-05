import { Form, Button } from "react-bootstrap"
import "./scss/main.scss"

function App() {

  return (
    <div>
      <h1 className="text-center">NETSI</h1>

      <div className={`d-flex flex-column justify-content-center align-items-center`} >
        <div className={`mt-2`} >
          <h2>Login:</h2>
        </div>
        <div className={`mt-2`} >
          <Form.Control type="text" placeholder="Username" />
        </div>
        <div className={`mt-2`} >
          <Form.Control type="password" placeholder="Password" />
        </div>
        <div className={`mt-2`} >
          <Button variant="primary" >Login</Button>
        </div>
      </div>
    </div>
  )
}

export default App
