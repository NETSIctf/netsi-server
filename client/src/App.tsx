import { Link } from "react-router-dom";
import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";

function App() {
  checkLoginNavigate();

  return (
    <div className="d-flex flex-column p-2 ms-2" >
      <header>
        <h1> NETSI MAIN PAGE </h1>
      </header>
      <main className="mt-2" >
        Fish is objectively bad.
      </main>
      <footer className="mt-2 d-flex flex-column" >
        <div>
          {Date.now()}ms since epoch
        </div>
      </footer>
    </div>
  )
}

export default App
