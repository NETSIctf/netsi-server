import { checkLoginNavigate, checkAdmin } from "../components/LoginChecks";
import axios from "axios"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function List() {
  checkLoginNavigate();

  const [ctfs, setCtfs] = useState<any[]>([]);
  const [isAdmin, setAdmin] = useState(false);

  useEffect(() => {
    axios.get("/api/ctfs/list").then(result => {
      setCtfs(result.data);
    }).catch(reject => {
      console.log(reject);
    })

    checkAdmin([setAdmin]);
  }, [])

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
        <div className={`mt-2`} >
          <h2>CTFs:</h2>
        </div>
        {isAdmin ? <Link to="/ctfs/add" className="btn btn-primary mb-2" >Add CTF</Link> : ""}
        <div className={`list-group`} >
          {ctfs.map((ctf, index) => {
            return (
              <Link to={{pathname:`/ctfs/view`, search:`?title=${encodeURIComponent(ctf.name)}`}} className={`list-group-item list-group-item-action dark-list-group-item dark-list-group-item-hover`} key={index} >{ctf.name}</Link>
            )
          })}
        </div>
    </div>
  )
}