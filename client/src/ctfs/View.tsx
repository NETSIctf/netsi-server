import { checkLoginNavigate } from "../components/LoginChecks";
import axios, { AxiosError } from "axios"
import { useState, useEffect } from "react";
import NoPage from '../NoPage'
import { useNavigate, useParams } from "react-router-dom";

type ctfData = {
  name: string,
  description: string,
  start: string,
  end: string
}

export default function View() {
  const navigate = useNavigate();
  const params = useParams();

  const [ctf, setCtf] = useState<ctfData>({ name: "Loading...", description: "No Description", start: "", end: "" });
  const [status, setStatus] = useState<number>(200);

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
    axios.get(`/api/ctfs/${ctfName}`).then(result => {
      setStatus(result.status);

      // properly display the date
      result.data.start = new Date(result.data.start).toISOString().slice(0, 16).replace("T", ", ");
      result.data.end = new Date(result.data.end).toISOString().slice(0, 16).replace("T", ", ");

      setCtf(result.data);
    }).catch((reject: AxiosError) => {
      setStatus(reject.response?.status || 500);
    })
  }, [])

  switch (status) {
    case 200:
      return (
        <div className="d-flex flex-column justify-content-center align-items-center mt-2">
          <h1>{ctf.name}</h1>
          <p>{ctf.description}</p>
          <p>Start: {ctf.start}</p>
          <p>End: {ctf.end}</p>
          <button onClick={deleteCTF} className="btn btn-danger">Delete CTF</button>
        </div>
      )
    case 404:
      return <NoPage />
    case 500:
      return <div>
        Code 500 Internal Server Error
      </div>
    default:
      return <div>
        Code {status}
      </div>
  }

}