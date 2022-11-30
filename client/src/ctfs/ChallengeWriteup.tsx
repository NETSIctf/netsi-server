import { checkAdmin, checkLoginNavigate } from "../components/LoginChecks";
import { useLocation } from "react-router-dom";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';
import { Button } from "react-bootstrap";
import axios from "axios";


export default function ChallengeWriteup() {
  checkLoginNavigate();
  const navigate = useNavigate();
  const ctfName = decodeURIComponent(new URLSearchParams(useLocation().search).get("title") as string); // name of ctf from query
  const challengeName = decodeURIComponent(new URLSearchParams(useLocation().search).get("challenge") as string); // name of challenge from query

  const [writeup, setWriteup] = useState("");
  const [isAdmin , setAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);

  function saveWriteup() {
    setSaving(true);
    axios.post("/api/ctfs/updateWriteup", {title: ctfName, challengeTitle: challengeName, writeup: writeup}).then(resolve => {
      setSaving(false);
      if (resolve.status === 200) {
        setSuccess("Writeup saved successfully");
      }
    }).catch(reject => {
      setSaving(false);
      console.error(reject);
      setError(reject.response.data);
    })
  }

  function returnToChallenge() {
    navigate(`/ctfs/view?title=${encodeURIComponent(ctfName)}`);
  }

  useEffect(() => {
    
    checkAdmin()
    .then(val => setAdmin(val));

    axios.get(`/api/ctfs/writeup?title=${encodeURIComponent(ctfName)}&challenge=${encodeURIComponent(challengeName)}`).then(resolve => {
      if (resolve.status === 200) {
        setWriteup(resolve.data.writeup);
      }
      else {
        console.error(resolve);
        alert("Error getting writeup" + resolve);
      }
    }).catch(reject => {
      console.error(reject);
      alert("Error getting writeup\n" + reject);
    })
  }, [])

  return (
    <div>
      { isAdmin ?
        /* If the user is an admin, give them the editor. Else, only show them the writeup */
        <div>
          <MDEditor
            height={500}
            value={ writeup }
            onChange={(value) => setWriteup(value as string)}
          />
          <div className={`mt-2 d-flex flex-column justify-content-center align-items-center`}>
            <div className={`alert alert-danger alert-dismissible rounded d-${error ?  "block show" : "none"}`}>
              {error}
              <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setError("")} />
            </div>
            <div className={`alert alert-success alert-dismissible rounded d-${success ?  "block show" : "none"}`}>
              {success}
              <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setSuccess("")} />
            </div>
          </div>

          <div className={`mt-2 text-center`} >
            <Button variant="secondary" onClick={ returnToChallenge }>Cancel</Button>
          </div>

          <div className={`text-center mt-2`}>
            <Button variant="success" onClick={ saveWriteup } disabled={saving}>{saving ? `Saving...` : `Save`}</Button>
          </div>

          <div className={`text-center mt-2`}>
            <Button variant={`success`} onClick={ () => { saveWriteup(); returnToChallenge() } } disabled={saving} >{saving ? `Saving...` : `Save and exit`}</Button>
          </div>
        </div>


        : <div>
          <MDEditor.Markdown source={writeup} />
          <div className={`mt-2 text-center`} >
            <Button variant="secondary" onClick={() => navigate(`/ctfs/view?title=${encodeURIComponent(ctfName)}`)}>Return to ctf</Button>
          </div>
        </div>
      }
    </div>
  )
}