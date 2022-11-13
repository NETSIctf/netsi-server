import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

function App() {
  checkLoginNavigate();
  
  return (
    <div>
      <h1> NETSI MAIN PAGE </h1>
      Fish is objectively bad, and this is objectively a test for some webhooks
    </div>
  )
}

export default App
