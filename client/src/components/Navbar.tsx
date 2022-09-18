import "../scss/main.scss";

function Navbar() {
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
                  <a className="nav-link" href="/webshell">Webshell</a>
                  <a className="nav-link" href="/ctfs">CTFs</a>
                </ul>
              </div>

              { login }
          </div>
      </nav>
  )
}

export default Navbar
