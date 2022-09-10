import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Logout() {
    const navigate = useNavigate();

    axios.get('/api/logout').catch().finally(() => {
        console.log(sessionStorage.getItem('token'));
        navigate('/login');
    })
}