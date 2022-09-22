import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

function App() {
  checkLoginNavigate();
  
  return (
    <div>
      wow main page
    </div>
  )
}

export default App
