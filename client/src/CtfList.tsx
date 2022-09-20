import { checkLoginNavigate } from "./components/LoginChecks";
import "./scss/main.scss";
import axios from "axios"
import { useState, useEffect } from "react";

function CtfList() {
  checkLoginNavigate();

  let [ctfs, setCtfs] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/ctfs/list").then(result => {
      setCtfs(result.data);
    }).catch(reject => {
      console.log(reject);
      setCtfs([]);
    })
  }, [])

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
        <div className={`mt-2`} >
          <h2>CTFs:</h2>
        </div>
        <a href="/ctf/add" className="btn btn-primary mb-2">Add CTF</a>
        <div className={`list-group`} >
          {ctfs.map((ctf, index) => {
            return (
              <a href={`/ctfs/${ctf.name}`} className={`list-group-item list-group-item-action dark-list-group-item`} key={index} >{ctf.name}</a>
            )
          })}
        </div>
    </div>
  )
}

export default CtfList
