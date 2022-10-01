import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function checkLoginNavigate() {// checks if the user is logged in. If they are, it does nothing. If they are not, it redirects them to the login page.
  const navigate = useNavigate();
  useEffect(() => {
    axios.get("/api/login").then(resolve => {
      if (resolve.status !== 200) {
        navigate("/login");
      }
    }).catch(() => {
      navigate("/login");
    })
  }, [])
}


export function checkLogin() {
  return new Promise((resolve: (value: boolean) => void) => {
    axios.get("/api/login").then(response => {
      if (response.status !== 200) {
        resolve(true);
      } else {
        resolve(true);
      }
    }).catch(() => {
      resolve(false);
    })
  })
}