import "./scss/main.scss";
import { useNavigate } from "react-router-dom";
import checkLogin from "./checkLogin";

function App() {
  const navigate = useNavigate();

  checkLogin();
  return (
    <div>
      wow main page
    </div>
  )
}

export default App
