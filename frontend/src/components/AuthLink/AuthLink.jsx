import "./AuthLink.css"
import { useNavigate, useLocation} from "react-router-dom";

function AuthLink({ text, linkText, onClick }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === "/login";

    const handleClick = ()=>{
        if (isLogin){
            navigate("/register")
        }else{
            navigate("/login")
        }
    }

    return (
        <p className="auth-link">
            {text}
            <span onClick={(handleClick)}>
                {" "}{linkText}
            </span>
        </p>
    );
}

export default AuthLink;