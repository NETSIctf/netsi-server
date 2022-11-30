import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

import { checkLoginNavigate } from "../../components/LoginChecks";
import { ctfData as ctfDataType } from "../Types";
import { getUsername } from "../../util";
import MembersList from "./MembersList";
import CTFInfo from "./CTFInfo";
import Settings from "./Settings";

export type updateActionsType = {
    members: {
        add: () => Promise<any>;
        remove: () => Promise<any>;
    };
    delete: () => Promise<any>;
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
            add: async () => { },
            remove: async () => { },
        },
        delete: async () => { },
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
    const [showSettings, setShowSettings] = useState(false);

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
                return new Promise<boolean>((resolve, reject) => {
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
                return new Promise<boolean>((resolve, reject) => {
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
        delete: () => {
            return new Promise<void>((resolve, reject) => {

            })
         },
        challenges: {
            add: () => { },
            remove: () => { },
            solve: () => { },
        }
    }

    return (
        <CTFContext.Provider value={[ctfData, updateActions]} >
            <Settings show={showSettings} destroy={() => setShowSettings(false)} />
            <CTFInfo updating={updating} openSettings={() => setShowSettings(true)} />
            <MembersList />
        </CTFContext.Provider>
    );
}

