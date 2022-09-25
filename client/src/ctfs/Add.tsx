import { checkLoginNavigate } from "../components/LoginChecks";
import axios from "axios";
import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

export default function Add() {
  let navigate = useNavigate();
  checkLoginNavigate();

  const [error, setError] = useState("");
  const [title, SetCTFTitle] = useState("");
  const [description, SetCTFDescription] = useState("");
  
  function addCTF() {
    // adds a CTF to the database
    axios.post("/api/ctfs/add", { name: title, description: description}).then(resolve => {
      console.log(resolve);
      if (resolve.status === 200) {
        // success
        console.log("success");
        navigate("/ctfs/" + title);
      }
    }).catch(reject => {
      console.error(reject);
      if (reject.response.data == "ctf already exists") {
        console.log("ctf already exists");
        setError("CTF already exists");
      }
      else if (reject.response.data == "Invalid name") {
        console.log("Invalid name");
        setError("Invalid name. Names cannot contain spaces, slashes, or be empty.");
      }
    })
  }

  
  return (
    <div>
      <div className={`d-flex flex-column justify-content-center align-items-center`}>
        <div className={`mt-2`} >
            <h2>Add CTF:</h2>
          </div>
          <div className={`alert alert-danger alert-dismissible fade rounded d-${error == "" ?  "none" : "block show"}`} role="alert" >
            {error}
            <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setError("")} />
          </div>
          <div className={`mt-2`} >
            <Form.Control type="text" placeholder="Title" value={title} onChange={event => SetCTFTitle(event.target.value)} />
          </div>
          <div className={`mt-2`} >
            <Form.Control as="textarea" placeholder="Description" value={description} onChange={event => SetCTFDescription(event.target.value)} />
          </div>
          <div className={`mt-2`} >
            <Button variant="primary" onClick={() => addCTF()} >Add CTF</Button>
          </div>
      </div>
    </div>
  )
}