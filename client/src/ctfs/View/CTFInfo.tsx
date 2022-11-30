import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { RefreshCw, Settings } from "react-feather";
import { CTFContext } from "./View";
import { useContext } from "react";

export default function CTFInfo({ updating }: { updating: boolean }) {
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