import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { checkLoginNavigate } from "../../components/LoginChecks";
import * as utils from "./utils";

import { Settings } from "react-feather";

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