import { useContext, useState } from "react"
import { MinusSquare, PlusSquare } from "react-feather"
import { getUsername } from "../../util";
import { CTFContext } from "./View"

export default function MembersList() {
    const [ctfData, setCtfData] = useContext(CTFContext);

    var members = ctfData.members.map((name) => <Member name={name} key={name} />);


    return (
        <div className={`p-0 d-flex flex-column position-absolute top-50 end-0 translate-middle-y rounded-start border border-end-0 h-50`} >
            <div className="d-flex align-items-center border-bottom p-2" >
                <h1 className="me-5" >Members</h1>
                {!ctfData.members.includes(getUsername()) ?
                    <PlusSquare className="text-success cursor-pointer" size="35" onClick={() => setCtfData.members.add()} /> : // User added or not
                    <MinusSquare className="text-danger cursor-pointer" size="35" onClick={() => setCtfData.members.remove()} />}
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