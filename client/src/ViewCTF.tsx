import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";
import axios from "axios"
import { useState, useEffect } from "react";
import NoPage from './NoPage'
import { useNavigate } from "react-router-dom";

function ViewCTF() {
  let navigate = useNavigate();
  checkLoginNavigate();

  // get the ctf name from the url
  let ctfName = window.location.pathname.split("/")[2];

  function deleteCTF() {
    // deletes a CTF from the database
    axios.post("/api/ctfs/delete/" + ctfName).then(resolve => {
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        console.log("success");
        navigate("/ctfs");
      }
    }).catch(reject => {
      console.error(reject);
      alert("Error deleting CTF\n" + reject);
    })
  }

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
        <button onClick={ deleteCTF } className="btn btn-danger">Delete CTF</button>
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
