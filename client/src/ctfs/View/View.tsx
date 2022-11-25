import { useParams } from "react-router-dom";
import { checkLoginNavigate } from "../../components/LoginChecks";
import * as utils from "./utils";
import {useNavigate} from "react-router-dom";

export default function View() {
    const params = useParams();
    const ctfName = params.ctf as string;
    const navigate = useNavigate();

    checkLoginNavigate();


    // TODO format when design is complete
    return (
        <div>
            {JSON.stringify(params)}
            {utils.test()}
            <button onClick={() => utils.deleteCTF(ctfName, navigate)}>Delete CTF</button>
        </div>
    );
}