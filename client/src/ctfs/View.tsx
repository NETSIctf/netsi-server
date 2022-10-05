import { checkLoginNavigate } from "../components/LoginChecks";
import axios, { AxiosError } from "axios"
import { useState, useEffect } from "react";
import NoPage from '../NoPage'
import { useNavigate, useParams } from "react-router-dom";

type ctfData = {
  name: string,
  description: string,
  start: string,
  end: string,
  members: string[],
}

export default function View() {
  const navigate = useNavigate();
  const params = useParams();

  const [ctf, setCtf] = useState<ctfData>({ name: "Loading...", description: "No Description", start: "", end: "", members: [] });
  const [status, setStatus] = useState<number>(200);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  checkLoginNavigate();

  // get the ctf name from the url
  const ctfName = params.ctfId;

  function deleteCTF() {// deletes a CTF from the database
    setDeleting(true);
    axios.post("/api/ctfs/delete/" + ctfName).then(resolve => {
      setDeleting(false);
      if (resolve.status === 200) {
        // success
        console.log("success");
        navigate("/ctfs");
      }
    }).catch(reject => {
      setDeleting(false);
      console.error(reject);
      alert("Error deleting CTF\n" + reject);
    })
  }

  function addMember() {
    setJoining(true);
    // adds a member to the CTF
    axios.post("/api/ctfs/addMember/" + ctfName).then(resolve => {
      setJoining(false);
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        window.location.reload();
      }
    }).catch(reject => {
      setJoining(false);
      console.error(reject);
      alert("Error Joining CTF\n" + reject);
    })
  }

  function removeMember() {
    setJoining(true);
    // removes a member from the CTF
    axios.post("/api/ctfs/removeMember/" + ctfName).then(resolve => {
      setJoining(false);
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        window.location.reload();
      }
    }).catch(reject => {
      setJoining(false);
      console.error(reject);
      alert("Error Leaving CTF\n" + reject);
    })
  }

  useEffect(() => { // load the ctf
    axios.get(`/api/ctfs/${ctfName}`).then(result => {
      setStatus(result.status);

      // properly display the date
      result.data.start = new Date(result.data.start).toISOString().slice(0, 16).replace("T", ", ");
      result.data.end = new Date(result.data.end).toISOString().slice(0, 16).replace("T", ", ");

      if (result.data.members.includes(result.data.username)) {
        setJoined(true);
      }

      if (!result.data.members.length) {
        // if there are no members, display none
        result.data.members = ['none'];
      }

      setCtf(result.data);
    }).catch((reject: AxiosError) => {
      setStatus(reject.response?.status || 500);
    })

    axios.get("/api/login", { params: { admin: true } })
      .then(resolve => {
        if (resolve.status == 200) {
          setAdmin(true);
        } else {
          setAdmin(false);
        }
      }).catch((err: AxiosError) => {
        if (err.response?.status == 500) {
          window.alert("500 ISE while attempting to auth");
        } else {
          setAdmin(false);
        }
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
          Members:
          <div className={`list-group`}>
            {ctf.members.map((member, index) => {
              return (
                <div className={`list-group-item list-group-item-action dark-list-group-item`} key={index} >{member}</div>
              )
            })}
          </div>
          {<button onClick={() => joined ? removeMember() : addMember()} className="btn btn-primary mt-4" disabled={joining} >{joining ? "Joining..." : joined ? "Leave CTF" : "Join CTF"}</button>}
          {isAdmin ? <button onClick={() => deleteCTF()} className="btn btn-danger mt-2" disabled={deleting} >{deleting ? "Deleting..." : "Delete CTF"}</button> : null}
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
        Code {status} we don't know whats wrong lol
      </div>
  }

}