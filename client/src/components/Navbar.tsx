import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import BsNavbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
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
    <BsNavbar variant="dark" bg="dark" className="text-light" >
      <div className="container-fluid">
        <BsNavbar.Brand href="/" >NETSI</BsNavbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/webshell">Webshell</Nav.Link>
          <Nav.Link href="/ctfs">CTFs</Nav.Link>
        </Nav>

        {login}
      </div>
    </BsNavbar>
  )
}

export default Navbar
