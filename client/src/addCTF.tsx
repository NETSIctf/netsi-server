import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";
import axios from "axios";
import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

function AddCTF() {
  let navigate = useNavigate();

  const [duplicateFail, setDuplicateFail] = useState(false);
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
        setDuplicateFail(true);
      }
    })
  }

  checkLoginNavigate();
  return (
    <div>
      <div className={`alert alert-danger alert-dismissible fade rounded d-${duplicateFail ? "block show" : "none"}`} role="alert" >
          CTF already exists
          <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={() => setDuplicateFail(false)} />
      </div>
      <div className={`d-flex flex-column justify-content-center align-items-center`}>
        <div className={`mt-2`} >
            <h2>AddCTF:</h2>
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

export default AddCTF
