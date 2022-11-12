import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/logout').then(() => {
            navigate('/login');
        })
    }, [])

    return <div>
        Logging you out...
    </div>;
}