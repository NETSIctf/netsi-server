import { checkLoginNavigate } from "../components/LoginChecks";
import axios from "axios";
import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";

export default function AddChallenge() {
  let navigate = useNavigate();
  checkLoginNavigate();

  const [error, setError] = useState("");
  const [name, SetName] = useState("");
  const [description, SetDescription] = useState("");
  const [points, SetPoints] = useState("");

  const ctfName = useParams().ctfId;

  function addChallenge() {
    // adds a challenge to the database
    axios.post("/api/ctfs/addChallenge/" + ctfName, {
      name: name,
      description: description,
      points: points
    }).then(resolve => {
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        navigate("/ctfs/" + ctfName);
      }
    }).catch(reject => {
      console.error(reject);
      setError(reject.response.data);
    })
  }

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center`}>
      <div className={`mt-2`} >
        <h2>Add Challenge:</h2>
      </div>
      <div className={`alert alert-danger alert-dismissible fade rounded d-${error == "" ?  "none" : "block show"}`} role="alert" >
        {error}
        <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setError("")} />
      </div>
      <div className={`mt-2`} >
        <Form.Control type="text" placeholder="Name" value={name} onChange={event => SetName(event.target.value)} />
      </div>
      <div className={`mt-2`} >
        <Form.Control as="textarea" placeholder="Description" value={description} onChange={(event) => SetDescription(event.target.value)} />
      </div>
      <div className={`mt-2`} >
        <Form.Control type="number" placeholder="Points" value={points} onChange={(event) => SetPoints(event.target.value)} />
      </div>
      <div className={`mt-2`} >
        <Button variant="primary" onClick={() => addChallenge()}>Add Challenge</Button>
      </div>
      <div className={`mt-2`} >
        <Button variant="secondary" onClick={() => navigate("/ctfs/" + ctfName)}>Cancel</Button>
      </div>
    </div>
  )
}