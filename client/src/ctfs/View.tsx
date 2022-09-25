import { checkLoginNavigate } from "../components/LoginChecks";
import axios from "axios"
import { useState, useEffect } from "react";
import NoPage from '../NoPage'
import { useNavigate, useParams } from "react-router-dom";

type ctfData = {
  
}

export default function View() {
  const navigate = useNavigate();
  const params = useParams();

  const [ctf, setCtf] = useState<any>();
  const [error, setError] = useState(false);

  checkLoginNavigate();

  // get the ctf name from the url
  const ctfName = params.ctfId;

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
        <p>{ctf.start}</p>
        <p>{ctf.end}</p>
        <button onClick={deleteCTF} className="btn btn-danger">Delete CTF</button>
      </div>
    )
  }
  else {
    return (
      <NoPage />
    )
  }

}