import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { checkLoginNavigate } from "../components/LoginChecks";

import { Settings } from "react-feather";

export default function View() {
    const params = useParams();
    const ctfName = params.ctf;

    checkLoginNavigate();

    function deleteCTF() { }

    function addMember() { }

    function deleteMember() { }

    function solve() { }

    function deleteChallenge() { }

    return (
        <div className={`p-3 d-flex flex-column`} >
            <div className="d-flex align-items-center" >
                <div className="d-flex flex-column" >
                    <h1 className="d-block" >ctf/{ctfName}</h1>
                </div>

                <div className="ms-auto" >
                    <Button variant="outline-light" ><Settings className="d-block" size="18" /></Button>
                </div>
            </div>

            <h6 className="d-block" >Filler_StartDate -&gt; Filler_EndDate</h6>
        </div>
    );
}