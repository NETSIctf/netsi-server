import axios from "axios";
import { useNavigate } from "react-router-dom";

export function checkLoginNavigate() {
  // checks if the user is logged in. If they are, it does nothing. If they are not, it redirects them to the login page.
  const navigate = useNavigate();

  axios.get("/api/login").then(resolve => {
    if (resolve.status !== 200) {
      navigate("/login");
    }
  }).catch(() => {
    navigate("/login");
  })
}

export async function checkLogin() {
  axios.get("/api/login").then(resolve => {
    if (resolve.status !== 200) {
      return false;
    } else {
      return true;
    }
  }).catch(() => {
    return false;
  })
}