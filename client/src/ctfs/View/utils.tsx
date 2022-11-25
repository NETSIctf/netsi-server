import axios from 'axios';
import {NavigateFunction} from "react-router-dom";

export function deleteCTF(ctfName: string, navigate: NavigateFunction): boolean {
  console.log("deleting CTF");
  if (!confirm("Are you sure you want to delete this CTF?")) {
    return false;
  }

  axios.post(`/api/ctfs/delete`, { "title": ctfName }).then(resolve => {
    if (resolve.status == 200) {
      console.log("success");
      navigate("/ctfs");
    }
    return true;
  }).catch(err => {
    console.error(err);
    alert("Error deleting CTF\n" + err);
    return false;
  })

  return false;
}

export function addMember() {}

export function deleteMember() {}

export function solve() {}

export function deleteChallenge() {}

export function test() {
  return "test";
}