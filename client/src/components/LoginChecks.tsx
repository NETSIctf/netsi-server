import axios, { AxiosError } from "axios";
import { useEffect } from "react";
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

export async function checkAdmin() {
  try {
    let response = await axios.get("/api/login", { params: { admin: true } });
    if (response.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status == 500) {
        alert("500 ISE while attempting to auth");
      }

      return false;
    } else {
      alert("Client Error, check console for details");
      console.error(err);
      return false;
    }
  }
}