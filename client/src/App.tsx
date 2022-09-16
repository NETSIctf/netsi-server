import { checkLogin } from "./components/LoginChecks";
import "./scss/main.scss";

function App() {

  checkLogin();
  return (
    <div>
      wow main page
    </div>
  )
}

export default App
