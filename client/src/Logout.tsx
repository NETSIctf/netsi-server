import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Logout() {
    const navigate = useNavigate();

    axios.get('/api/logout').then(() => {
        sessionStorage.removeItem('token');
    }).catch().finally(() => {
        navigate('/login');
    })

    return (
        <div>
            Logging out...
        </div>
    )
}