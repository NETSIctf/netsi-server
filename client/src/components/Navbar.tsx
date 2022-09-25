import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import BsNavbar from "react-bootstrap/Navbar";
import "../scss/main.scss";

function Navbar() {
  const [login, setLogin] = useState(<Link className="navbar-brand" to="/logout">Logout</Link>);

  useEffect(() => {
    if (window.location.pathname === "/login") {
      setLogin(<Link className="navbar-brand" to="/login">Login</Link>);
    }
  }, []);

  return (
      <BsNavbar variant="dark" bg="dark" expand="lg" className="text-light" >
          <div className="container-fluid">
              <BsNavbar.Brand href="/" >NETSI</BsNavbar.Brand>
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <Link className="nav-link" to="/webshell">Webshell</Link>
                  <Link className="nav-link" to="/ctfs">CTFs</Link>
                </ul>
              </div>

              { login }
          </div>
      </BsNavbar>
  )
}

export default Navbar
