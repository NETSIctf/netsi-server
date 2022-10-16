import { checkAdmin, checkLoginNavigate } from "../components/LoginChecks";
import { useLocation } from "react-router-dom";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';
import { Button } from "react-bootstrap";


export default function ChallengeWriteup() {
  checkLoginNavigate();
  const navigate = useNavigate();
  const ctfName = decodeURIComponent(new URLSearchParams(useLocation().search).get("title") as string); // name of ctf from query
  const challengeName = decodeURIComponent(new URLSearchParams(useLocation().search).get("challenge") as string); // name of challenge from query

  const [writeup, setWriteup] = useState(`# ${ctfName} - ${challengeName} Writeup`);
  const [isAdmin , setAdmin] = useState(false);

  useEffect(() => {
    checkAdmin([setAdmin]);
  })

  return (
    <div>
      { isAdmin ?
        /* If the user is an admin, give them the editor. Else, only show them the writeup */
        <div>
          <MDEditor
            height={500}
            value={writeup}
            onChange={(value) => setWriteup(value as string)}
          />
          <div className={`text-center mt-2`}>
            <Button variant="success">Save</Button>
          </div>
          <div className={`mt-2 text-center`} >
            <Button variant="secondary" onClick={() => navigate(`/ctfs/view?title=${encodeURIComponent(ctfName)}`)}>Cancel</Button>
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