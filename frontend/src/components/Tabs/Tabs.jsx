import "./Tabs.css";
import { useNavigate, useLocation} from "react-router-dom";

function Tabs() {

    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === "/login";

    return (
        <div className="tabs">
            <button className={`tab ${isLogin ? "active":""}`}
                onClick={()=>navigate("/login")}
            >
                Ingresar
            </button>
            <button className={`tab ${!isLogin ? "active":""}`}
                onClick={()=>navigate("/register")}
            >
                Crear cuenta
            </button>
        </div>
    );
}

export default Tabs;