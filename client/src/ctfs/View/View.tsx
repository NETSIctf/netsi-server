import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Settings } from "react-feather";

import { checkLoginNavigate } from "../../components/LoginChecks";
import * as utils from "./utils";
import MembersList from "./MembersList";

export default function View() {
    const params = useParams();
    const ctfName = params.ctf as string;
    const navigate = useNavigate();

    checkLoginNavigate();


    // TODO format when design is complete
    return (
        <>
            <CTFInfo />
            <MembersList />
        </>
    );
}

function CTFInfo() {
    const params = useParams();
    const ctfName = params.ctf as string;

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
                <span className="d-block" >69/420 points</span>
            </div>
    )
}