import { useParams } from "react-router-dom";
import { checkLoginNavigate } from "../components/LoginChecks";

export default function View() {
    const params = useParams();
    const ctfName = params.ctf;

    checkLoginNavigate();

    function deleteCTF() {}

    function addMember() {}

    function deleteMember() {}

    function solve() {}

    function deleteChallenge() {}

    return (
        <>
            {JSON.stringify(params)}
        </>
    );
}