import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";

import {
    FiHome,
    FiBox,
    FiShoppingCart,
    FiBarChart2,
    FiSettings,
    FiLogOut,
} from "react-icons/fi";

function Sidebar({ user, isMenuOpen, setIsMenuOpen }) {

    //const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {

        setIsMenuOpen(false);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/login", { replace: true });

    };

    return (

        <>

            {isMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>

                <div className="sidebar-logo">

                    <Logo compact={true} />

                    <span className="sidebar-business-name">
                        {user?.businessName || "Mi tienda"}
                    </span>

                </div>

                <nav className="sidebar-menu">

                    <NavLink
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        <FiHome className="menu-icon" />
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/inventario"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        <FiBox className="menu-icon" />
                        Inventario
                    </NavLink>

                    <NavLink
                        to="/ventas"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        <FiShoppingCart className="menu-icon" />
                        Ventas
                    </NavLink>

                    <NavLink
                        to="/prediccion"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        <FiBarChart2 className="menu-icon" />
                        Predicción
                    </NavLink>

                    <NavLink
                        to="/ajustes"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        <FiSettings className="menu-icon" />
                        Ajustes
                    </NavLink>

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >

                    <FiLogOut className="menu-icon" />

                    <span>
                        Salir
                    </span>

                </button>

            </aside>

        </>

    );

}

export default Sidebar;