import { useContext } from "react"
import { MinusSquare, Plus } from "react-feather"
import { CTFContext } from "./View"

export default function Challenges() {
    const [ctfData, setCtfData] = useContext(CTFContext);

    console.log(ctfData);

    return <div className="d-flex flex-column justify-content-center text-center" >
        <h1>Challenges</h1>
        <div id="challenges" >

            <ListBox className="justify-content-center align-items-center cursor-pointer" >
                <Plus size="60" />
            </ListBox>
        </div>
    </div>
}

function Challenge() {
    return <ListBox>
        <div className="d-flex" >
            <div className="flex-grow-1" >
                <h1>Challenge_title</h1>
            </div>
            <MinusSquare className="text-danger d-block me-2 cursor-pointer" size="40" />
        </div>
        <section>
            challenge_info
        </section>
    </ListBox>
}

function ListBox({ children, className="" }: { children: React.ReactNode, className?: string }) {
    return <div className={`border rounded d-flex flex-column p-2 ${className}`} >
        {children}
    </div>
}