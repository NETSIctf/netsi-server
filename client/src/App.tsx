import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

function App() {
  checkLoginNavigate();
  
  return (
    <div>
      <h1> NETSI MAIN PAGE </h1>
      I like fish.
    </div>
  )
}

export default App
