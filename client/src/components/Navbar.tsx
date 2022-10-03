import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import BsNavbar from "react-bootstrap/Navbar";
import { checkLogin } from "./LoginChecks";

function Navbar() {
  const [login, setLogin] = useState<ReactNode[]>([<Link key={"logout"} className="navbar-brand" to="/logout">Logout</Link>]);
  const { pathname } = useLocation();

  useEffect(() => {
    checkLogin().then(resolve => {
      if (resolve) {
        setLogin([<Link key={"logout"} className="navbar-brand" to="/logout">Logout</Link>]);
      } else {
        setLogin([<Link key={"login"} className="navbar-brand" to="/login">Login</Link>, <Link key={"register"} className="navbar-brand" to="/register">Register</Link>]);
      }
    })
  }, [pathname]);

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

        {login}
      </div>
    </BsNavbar>
  )
}

export default Navbar
