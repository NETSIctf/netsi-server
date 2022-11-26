import { useContext } from "react"
import { MinusSquare, PlusSquare } from "react-feather"
import { CTFContext } from "./View"

export default function MembersList() {
    const ctfData = useContext(CTFContext);

    const members = ctfData.members.map((name) => <Member name={name} key={name} />);

    return (
        <div className={`p-0 d-flex flex-column position-absolute top-50 end-0 translate-middle-y rounded-start border border-end-0 h-50`} >
            <div className="d-flex align-items-center border-bottom p-2" >
                <h1 className="me-5" >Members</h1>
                <PlusSquare className="text-success cursor-pointer" size="35" />
            </div>
            {members}
        </div>
    )
}

export function Member({ name }: { name: string }) {
    return <div className="p-2 border-bottom d-flex align-items-center" >
        <h2 className="me-auto">{name}</h2>
        <MinusSquare className="text-danger cursor-pointer" size="35" />
    </div>
}