import { checkLoginNavigate } from "../components/LoginChecks";
import axios from "axios"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function List() {
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
        <Link to="/ctf/add" className="btn btn-primary mb-2" >Add CTF</Link>
        <div className={`list-group`} >
          {ctfs.map((ctf, index) => {
            return (
              <Link to={`/ctfs/${ctf.name}`} className={`list-group-item list-group-item-action dark-list-group-item`} key={index} >{ctf.name}</Link>
            )
          })}
        </div>
    </div>
  )
}