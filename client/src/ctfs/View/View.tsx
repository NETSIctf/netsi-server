import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Settings } from "react-feather";
import React, { useContext, useEffect, useState } from "react";

import { checkLoginNavigate } from "../../components/LoginChecks";
import * as utils from "./utils";
import MembersList from "./MembersList";
import axios from "axios";
import { ctfData as ctfDataType } from "../Types";

export const CTFContext = React.createContext<ctfDataType>({
    members: [],
    challenges: [],
    description: "",
    start: "",
    end: "",
    name: ""
});

export default function View() {
    const params = useParams();
    const ctfName = params.ctf as string;
    const navigate = useNavigate();

    const [ctfData, setCtfData] = useState<ctfDataType>({ members: [], challenges: [], description: "", start: "", end: "", name: "" })

    checkLoginNavigate();

    useEffect(() => { // Initial CTF Load
        const loader = async () => {
            var request = await axios.get("/api/ctfs/view", {
                params: {
                    title: ctfName
                }
            })

            var data = request.data as ctfDataType;
            setCtfData(data);
        }

        loader()
            .catch((err: Error) => {
                throw err;
            })
    }, []);

    // TODO format when design is complete
    return (
        <CTFContext.Provider value={ctfData} >
            <CTFInfo />
            <MembersList />
        </CTFContext.Provider>
    );
}

function CTFInfo() {
    const params = useParams();
    const ctfName = params.ctf as string;

    const ctfData = useContext(CTFContext);

    const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric", year: "numeric", weekday: "short", minute: "numeric", hour: "numeric", hourCycle: "h24" };

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

            <h6 className="d-block" >{new Date(Date.parse(ctfData.start)).toLocaleDateString("en-US", dateOptions)} -&gt; {new Date(Date.parse(ctfData.end)).toLocaleDateString("en-US", dateOptions)}</h6>
            <span className="d-block" >69/420 points</span>
        </div>
    )
}