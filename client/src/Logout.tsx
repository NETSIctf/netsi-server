import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Logout() {
    const navigate = useNavigate();

    axios.get('/api/logout').then(() => {
        navigate('/login');
    })
}