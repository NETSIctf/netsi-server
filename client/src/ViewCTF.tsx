import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";
import axios from "axios"
import { useState, useEffect } from "react";
import NoPage from './NoPage'

function ViewCTF() {
  checkLoginNavigate();

  // get the ctf name from the url
  let ctfName = window.location.pathname.split("/")[2];

  let [ctf, setCtf] = useState<any>({});
  let [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`/api/ctf/${ctfName}`).then(result => {
      setCtf(result.data);
    }).catch(reject => {
      setError(true);
    })
  }, [])

  if (ctf.description == "") {
    ctf.description = <i>No description</i>;
  }

  if (!error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mt-2">
        <h1>{ctf.name}</h1>
        <p>{ctf.description}</p>
      </div>
    )
  }
  else {
    return (
      <NoPage />
    )
  }

}

export default ViewCTF
