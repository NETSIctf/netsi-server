import "./scss/main.scss";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  let login = <a className="navbar-brand" href="/logout">Logout</a>;

  if (window.location.pathname === "/login") {
    login = <a className="navbar-brand" href="/login">Login</a>;
  }


  return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
              <a className="navbar-brand" href="/">NETSI</a>
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link" href="/webshell">Webshell</a>
                  </li>
                </ul>
              </div>

              { login }
          </div>
      </nav>
  )
}

export default Navbar
