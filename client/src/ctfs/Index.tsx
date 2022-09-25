import { Route, Routes } from "react-router-dom";
import Add from "./Add";
import List from "./List";
import View from "./View";

export default function Index() {
    return (
        <Routes>
            <Route index element={<List />} />
            <Route path="add" element={<Add />} />
            <Route path=":ctfId" element={<View />} />
        </Routes>
    )
}