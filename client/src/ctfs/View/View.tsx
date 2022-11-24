import { useParams } from "react-router-dom";
import { checkLoginNavigate } from "../../components/LoginChecks";
import * as utils from "./utils";

export default function View() {
    const params = useParams();
    const ctfName = params.ctf;

    checkLoginNavigate();

    return (
        <>
            {JSON.stringify(params)}
            {utils.test()}
        </>
    );
}