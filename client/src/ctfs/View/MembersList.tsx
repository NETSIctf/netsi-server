import { MinusSquare, PlusSquare } from "react-feather"

export default function MembersList() {
    return (
        <div className={`p-0 d-flex flex-column position-absolute top-50 end-0 translate-middle-y rounded-start border border-end-0 h-50`} >
            <div className="d-flex align-items-center border-bottom p-2" >
                <h1 className="me-5" >Members</h1>
                <PlusSquare className="text-success cursor-pointer" size="35" />
            </div>
            <Member name="0x41*32" />
            <Member name="wsquarepa" />
            <Member name="GiveBread" />
        </div>
    )
}

export function Member({ name }: { name: string }) {
    return <div className="p-2 border-bottom d-flex align-items-center" >
        <h2 className="me-auto">{name}</h2>
        <MinusSquare className="text-danger cursor-pointer" size="35" />
    </div>
}