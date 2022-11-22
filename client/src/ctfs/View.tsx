import {checkAdmin, checkLoginNavigate} from "../components/LoginChecks";
import axios, { AxiosError } from "axios"
import { useState, useEffect } from "react";
import NoPage from '../NoPage'
import { useNavigate, useLocation } from "react-router-dom";
import { Form } from "react-bootstrap";
import { ctfData } from "./Types";
import { parseDate } from "./Utils";

export default function View() {
  const navigate = useNavigate();
  const ctfName = decodeURIComponent(new URLSearchParams(useLocation().search).get("title") as string); // name of ctf from query

  const [ctf, setCtf] = useState<ctfData>({
    name: "Loading...",
    description: "",
    start: "",
    end: "",
    members: [],
    challenges: []
  });

  const [status, setStatus] = useState<number>(200);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [solving, setSolving] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [points, setPoints] = useState(0); // current CTF points
  const [maxPoints, setMaxPoints] = useState(0); // max CTF points
  const [username, setUsername] = useState("");
  const [flag, setFlag] = useState(""); // flag to submit
  const [solveChallengeError, setSolveChallengeError] = useState("");

  checkLoginNavigate();

  function deleteCTF() {// deletes a CTF from the database
    if (!confirm("Are you sure you want to delete this CTF?")) return; // confirm deletion
    setDeleting(true);
    axios.post(`/api/ctfs/delete`, {"title" : ctfName}).then(resolve => {
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
    axios.post(`/api/ctfs/addMember`, {"title":ctfName}).then(resolve => {
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
    // removes a member from the CTF
    setJoining(true);
    axios.post(`/api/ctfs/removeMember`, {"title" : ctfName}).then(resolve => {
      console.log(resolve);
      setJoining(false);
      if (resolve.status === 200) {
        // success
        window.location.reload();
      }
    }).catch(reject => {
      console.error(reject);
      setJoining(false);
      alert("Error Leaving CTF\n" + reject);
    })
  }

  function solve(challenge: string, isSolved: boolean) {
    // solves a challenge
    setSolving(true);
    axios.post(`/api/ctfs/${isSolved ? "unsolveChallenge": "solveChallenge"}`, {
      "title": ctfName,
      "challengeTitle": challenge,
      "flag": flag,
    }).then(resolve => {
      setSolving(false);
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        window.location.reload();
      }
      else {
        console.error(resolve);
        setSolveChallengeError(resolve.data);
      }
    }).catch(reject => {
      setSolving(false);
      console.error(reject);
      setSolveChallengeError(reject.response.data);
    })
  }

  function deleteChallenge(challenge: string) {
    // deletes a challenge
    setDeletingChallenge(true);
    if (!confirm("Are you sure you want to delete this challenge?")) return; // confirm deletion
    axios.post(`/api/ctfs/deleteChallenge`, {
      "title": ctfName,
      "challengeTitle": challenge
    }).then(resolve => {
      setDeletingChallenge(false);
      if (resolve.status === 200) {
        // success
        window.location.reload();
      }
      else {
        alert(resolve.status);
      }
    }).catch(reject => {
      setDeletingChallenge(false);
      console.error(reject);
      alert(reject.request.response);
    })
  }

  useEffect(() => { // load the ctf
    axios.get("/api/username").then(resolve => {
      setUsername(resolve.data);
    }).catch(reject => {
      console.error(reject);
    })

    axios.get(`/api/ctfs/view?title=${encodeURIComponent(ctfName)}`).then(result => {
      setStatus(result.status);

      // properly display the date
      result.data.start = parseDate(result.data.start);
      result.data.end = parseDate(result.data.end);

      if (result.data.members.includes(result.data.username)) {
        setJoined(true);
      }

      if (!result.data.members.length) {
        // if there are no members, display none
        result.data.members = ['none'];
      }

      // calculate and set the points
      let points = 0;
      for (let i = 0; i < result.data.challenges.length; i++) {
        // add the points of each challenge if it is solved
        if (result.data.challenges[i].solved_by) {
          points += result.data.challenges[i].points;
        }
      }

      setPoints(points);

      // set the max points
      let maxPoints = 0;
      for (let i = 0; i < result.data.challenges.length; i++) {
        maxPoints += result.data.challenges[i].points;
      }

      setMaxPoints(maxPoints);

      setCtf(result.data);
    }).catch((reject: AxiosError) => {
      setStatus(reject.response?.status || 500);
    })

    checkAdmin([setAdmin]);
  }, [])

  switch (status) {
    case 200:
      return (
        <div className="d-flex flex-column justify-content-center align-items-center mt-2">
          <h1>{ctf.name}</h1>
          <p>{ctf.description}</p>
          <p>Start: {ctf.start}</p>
          <p>End: {ctf.end}</p>
          <p>{points}/{maxPoints} Points</p>
          <p>Members:</p>
          <div className={`list-group`}>
            {ctf.members.map((member, index) => {
              return (
                <div className={`list-group-item list-group-item-action dark-list-group-item`} key={index} >{member}</div>
              )
            })}
          </div>
          <p className={`mt-3`}>Challenges:</p>
          <a className={`btn btn-primary`} href={`/ctfs/addChallenge?title=${encodeURIComponent(ctfName)}`}>Add Challenge</a>
          <div className={`list-group mt-3`}>
            {ctf.challenges.length === 0 ? <div className={`list-group-item list-group-item-action dark-list-group-item`}>none</div> : ctf.challenges.map((challenge, index) => {
              return (
                <div className={`list-group-item list-group-item-action dark-list-group-item mt-4`} key={index} >
                  <h3 className={challenge.solved_by ? `green-text` : `red-text`}>{challenge.name}</h3>
                  <p>{challenge.description}</p>
                  <p>Points: {challenge.points}</p>
                  <a className={`btn btn-primary`} href={`/ctfs/challengeWriteup?title=${encodeURIComponent(ctfName)}&challenge=${encodeURIComponent(challenge.name)}`}>Writeup</a>
                  <p className={`mt-2 ${challenge.solved_by ? `green-text` : `red-text`}`}>{challenge.solved_by ? `Solved by: ${challenge.solved_by}` : "Not solved"}</p>

                  <div className={`alert alert-danger alert-dismissible fade rounded d-${solveChallengeError == "" ?  "none" : "block show"}`} role="alert" >
                    {solveChallengeError}
                    <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setSolveChallengeError("")} />
                  </div>
                  { challenge.solved_by ? <p className={`green-text`}>Flag: { challenge.flag }</p> : ""}
                  <div>{ challenge.solved_by && (challenge.solved_by == username || isAdmin) ?
                    <button className={`btn btn-danger mt-3`} onClick={() => solve(challenge.name, true )} disabled={solving}>{ solving ? "unsolving..." : "Mark as unsolved" }</button>
                  :
                    joined ?
                      <div>
                        <Form.Control type={`text`} placeholder={`Flag`} className={`mt-3`} onChange={(e) => setFlag(e.target.value)} />
                        <button className={`btn btn-success mt-3`} onClick={() => solve(challenge.name, false)} disabled={solving}>{ solving ? "Solving..." : "Mark as solved"}</button>
                      </div>
                      : "" }</div>
                  {isAdmin ?
                    <div>
                      <div>
                        <a className = {`btn btn-primary mt-3`} href={`/ctfs/addChallenge?title=${encodeURIComponent(ctfName)}&challenge=${challenge.name}&edit=true`}>Edit Challenge</a>
                      </div>
                      <div>
                        <button className={`btn btn-danger mt-3`} onClick={() => deleteChallenge(challenge.name)} disabled={ deletingChallenge }>{ deletingChallenge ? "Deleting..." : "Delete" }</button>
                      </div>
                    </div>
                    : ""}
                </div>
              )
            })}
          </div>
          {<button onClick={() => joined ? removeMember() : addMember()} className="btn btn-primary mt-4" disabled={joining} >{joining ? joined ? "Leaving..." : "Joining..." : joined ? "Leave CTF" : "Join CTF"}</button>}
          {isAdmin ?
            <button onClick={() => deleteCTF()} className="btn btn-danger mt-3" disabled={deleting} >{deleting ? "Deleting..." : "Delete CTF"}</button>
            : null}
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