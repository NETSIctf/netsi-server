import {useContext, useEffect, useState} from "react"
import { MinusSquare, PlusSquare, RefreshCw } from "react-feather"
import { getUsername } from "../../util";
import { CTFContext } from "./View"

export default function MembersList() {
    const [ctfData, setCtfData] = useContext(CTFContext);
    const [changing, setChanging] = useState(false);
    const [added, setAdded] = useState(false);

    let members = ctfData.members.map((name) => <Member name={name} key={name} />);

    useEffect(() => {
        setAdded(ctfData.members.includes(getUsername()));
    }, [ctfData.members]);

    function addMember() {
        setChanging(true);
        setCtfData.members.add()
            .then(() => {
                setChanging(false);
                setAdded(true);
            })
            .catch(err => {
                setChanging(false);
            })
    }

    function removeMember() {
        setChanging(true);
        setCtfData.members.remove()
            .then(() => {
                setChanging(false);
                setAdded(false);
            })
            .catch(err => {
                setChanging(false);
            })
    }

    return (
        <div className={`p-0 d-flex flex-column position-absolute top-50 end-0 translate-middle-y rounded-start border border-end-0 h-50`} >
            <div className="d-flex align-items-center border-bottom p-2" >
                <h1 className="me-5" >Members</h1>
                <h1>{added}</h1>
                {!changing ?
                    !added ?
                        <PlusSquare className="text-success cursor-pointer" size="35" onClick={() => addMember()} /> : // User added or not
                        <MinusSquare className="text-danger cursor-pointer" size="35" onClick={() => removeMember()} />
                    : <RefreshCw className="rotate-constant-3s" size="35" />
                }
            </div>
            {members}
        </div>
    )
}

export function Member({ name }: { name: string }) {
    return <div className="p-2 border-bottom d-flex align-items-center" >
        <h2 className="me-auto">{name}</h2>
    </div>
}