import { Outlet, Route, Routes } from "react-router-dom";
import Add from "./Add";
import List from "./List";
import View from "./View/View";
import AddChallenge from "./AddChallenge";
import ChallengeWriteup from "./ChallengeWriteup";

import "../scss/ctfs.scss";

export default function Index() {
    return (
        <>
            <Routes>
                <Route index element={<List />} />
                <Route path="add" element={<Add />} />
                <Route path="addChallenge" element={<AddChallenge />} />
                <Route path="challengeWriteup" element={<ChallengeWriteup />} />
                <Route path=":ctf" element={<View />} />
            </Routes>

            <Outlet />
        </>
    )
}