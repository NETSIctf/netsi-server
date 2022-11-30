import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { RefreshCw, Settings } from "react-feather";
import React, { useContext, useEffect, useState } from "react";
import { checkLoginNavigate } from "../../components/LoginChecks";
import MembersList from "./MembersList";
import axios from "axios";
import { ctfData as ctfDataType } from "../Types";
import { getUsername } from "../../util";

export type updateActionsType = {
    members: {
        add: () => void;
        remove: () => void;
    };
    delete: () => void;
    challenges: {
        add: () => void;
        remove: () => void;
        solve: () => void;
    }
}

export const CTFContext = React.createContext<[ctfDataType, updateActionsType]>([
    {
        members: [],
        challenges: [],
        description: "",
        start: "",
        end: "",
        name: "",
    },
    {
        members: {
            add: () => { },
            remove: () => { },
        },
        delete: () => { },
        challenges: {
            add: () => { },
            remove: () => { },
            solve: () => { },
        }
    }
]);

export default function View() {
    const params = useParams();
    const ctfName = params.ctf as string;
    const [ctfData, setCtfData] = useState<ctfDataType>({ members: [], challenges: [], description: "", start: "", end: "", name: "" });
    const [updating, setUpdating] = useState(false);

    checkLoginNavigate();

    useEffect(() => { // Initial CTF Load
        axios.get("/api/ctfs/view", { params: { title: ctfName } })
            .then(response => {
                let data = response.data as ctfDataType;
                setCtfData(data);
            })
    }, []);

    const updateActions = {
        members: {
            add: () => {
                return new Promise((resolve, reject) => {
                    setUpdating(true);
                    axios.post("/api/ctfs/addMember", { "title": ctfName })
                        .then(() => {
                            setCtfData(p => {
                                let prev = { ...p };
                                prev.members = [...prev.members];
                                prev.members.push(getUsername());

                                return prev;
                            })

                            resolve(true);
                            setUpdating(false);
                        })
                        .catch(err => {
                            reject(err);
                            setUpdating(false);
                            alert("Something went wrong. Please try again!");
                        })
                })
            },
            remove: () => {
                return new Promise((resolve, reject) => {
                    setUpdating(true);
                    axios.post("/api/ctfs/removeMember", { "title": ctfName })
                        .then(() => {
                            setCtfData(prev => {
                                let index = prev.members.indexOf(getUsername());
                                if (index != -1) {
                                    prev.members.splice(index, 1);
                                }

                                return prev;
                            })

                            resolve(true);
                            setUpdating(false);
                        })
                        .catch(err => {
                            reject(err);
                            setUpdating(false);
                            alert("Something went wrong. Please try again!")
                        })
                })
            },
        },
        delete: () => { },
        challenges: {
            add: () => { },
            remove: () => { },
            solve: () => { },
        }
    }

    return (
        <CTFContext.Provider value={[ctfData, updateActions]} >
            <CTFInfo updating={updating} />
            <MembersList />
        </CTFContext.Provider>
    );
}

function CTFInfo({ updating }: { updating: boolean }) {
    const params = useParams();
    const ctfName = params.ctf as string;

    const [ctfData, setCtfData] = useContext(CTFContext);

    const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric", year: "numeric", weekday: "short", minute: "numeric", hour: "numeric", hourCycle: "h24" };

    return (
        <div className={`p-3 d-flex flex-column`} >
            <div className="d-flex align-items-center" >
                <div className="d-flex align-items-center" >
                    <h1 className="d-block me-2" >ctf/{ctfName}</h1>
                    <RefreshCw className={`d-${updating ? "block" : "none"} rotate-constant-3s`} size="35" />
                </div>

                <div className="ms-auto" >
                    <Button variant="outline-light"><Settings className="d-block" size="18" /></Button>
                </div>
            </div>

            <h6 className="d-block" >{new Date(Date.parse(ctfData.start)).toLocaleDateString("en-US", dateOptions)} -&gt; {new Date(Date.parse(ctfData.end)).toLocaleDateString("en-US", dateOptions)}</h6>
            <span className="d-block" >69/420 points</span>
        </div>
    )
}