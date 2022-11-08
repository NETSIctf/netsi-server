import axios, {AxiosError} from "axios";
import {useEffect} from "react";
import { useNavigate } from "react-router-dom";

export function checkLoginNavigate() {// checks if the user is logged in. If they are, it does nothing. If they are not, it redirects them to the login page.
  const navigate = useNavigate();
  const url = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  useEffect(() => {
    axios.get("/api/login").then(resolve => {
      if (resolve.status !== 200) {
        navigate(url);
      }
    }).catch(() => {
      navigate(url);
    })
  }, [])
}


export function checkLogin() {
  return new Promise((resolve: (value: boolean) => void) => {
    axios.get("/api/login").then(response => {
      if (response.status !== 200) {
        resolve(false);
      } else {
        resolve(true);
      }
    }).catch(() => {
      resolve(false);
    })
  })
}

export function checkAdmin([setAdmin]: [React.Dispatch<React.SetStateAction<boolean>>]) {
  axios.get("/api/login", { params: { admin: true } })
    .then(resolve => {
      if (resolve.status == 200) {
        setAdmin(true);
      } else {
        setAdmin(true);
      }
    }).catch((err: AxiosError) => {
    if (err.response?.status == 500) {
      window.alert("500 ISE while attempting to auth");
    } else {
      setAdmin(true);
    }
  })
}