import { checkLoginNavigate } from "../components/LoginChecks";
import axios from "axios";
import { useState, useEffect } from "react";
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from "react-router-dom";

export default function AddChallenge() {
  let navigate = useNavigate();
  checkLoginNavigate();

  const [error, setError] = useState("");
  const [name, SetName] = useState("");
  const [description, SetDescription] = useState("");
  const [points, SetPoints] = useState("");

  const [adding, setAdding] = useState(false);

  const ctfName = decodeURIComponent(new URLSearchParams(useLocation().search).get("title") as string);
  const isEdit = new URLSearchParams(useLocation().search).get("edit" as string) === "true";
  const challengeName = decodeURIComponent(new URLSearchParams(useLocation().search).get("challenge" as string) as string);

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/ctfs/editChallenge?title=${ctfName}&name=${ challengeName }`).then(resolve => {
        if (resolve.status === 200) {
          SetName(resolve.data.name);
          SetDescription(resolve.data.description);
          SetPoints(resolve.data.points.toString());
        }
      }).catch(reject => {
        console.error(reject);
        setError("Error getting challenge");
      })
    }
  }, []);

  function addChallenge() {
    // Adds/edits a challenge, depending on isEdit
    setAdding(true);
    const url = isEdit ? "/api/ctfs/editChallenge" : "/api/ctfs/addChallenge";
    axios.post(url, {
      title: ctfName,
      name: name,
      old_name: challengeName,
      description: description,
      points: points
    }).then(resolve => {
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        setAdding(false);
        navigate(`/ctfs/view?title=${encodeURIComponent(ctfName)}`);
      }
    }).catch(reject => {
      setAdding(false);
      console.error(reject);
      setError(reject.response.data);
    })
  }

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center`}>
      <div className={`mt-2`} >
        {isEdit ?
          <h2>Edit Challenge</h2>
          : <h2>Add Challenge:</h2>
        }
      </div>
      <div className={`alert alert-danger alert-dismissible fade rounded d-${ error == "" ?  "none" : "block show" }`} role="alert" >
        {error}
        <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={ () => setError("") } />
      </div>
      <div className={`mt-2`} >
        <Form.Control type="text" placeholder="Name" value={ name } onChange={event => SetName(event.target.value)} />
      </div>
      <div className={`mt-2`} >
        <Form.Control as="textarea" placeholder="Description" value={ description } onChange={(event) => SetDescription(event.target.value)} />
      </div>
      <div className={`mt-2`} >
        <Form.Control type="number" placeholder="Points" value={ points } onChange={(event) => SetPoints(event.target.value)} />
      </div>
      <div className={`mt-2`} >
          <Button variant="primary" onClick={ addChallenge } disabled={ adding }>{ adding ? "Adding Challenge..." : isEdit ? "Edit Challenge" : "Add Challenge" }</Button>
      </div>
      <div className={`mt-2`} >
        <Button variant="secondary" onClick={() => navigate(`/ctfs/view?title=${encodeURIComponent(ctfName)}`)}>Cancel</Button>
      </div>
    </div>
  )
}