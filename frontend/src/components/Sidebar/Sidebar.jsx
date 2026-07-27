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
    FiBell,
    FiMenu,
    FiX
} from "react-icons/fi";

function Sidebar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/login", { replace: true });

    };

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">
                <Logo compact={true} />
            </div>

            <nav className="sidebar-menu">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    <FiHome className="menu-icon" />
                    Inicio
                </NavLink>

                <NavLink
                    to="/inventario"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    <FiBox className="menu-icon" />
                    Inventario
                </NavLink>

                <NavLink
                    to="/ventas"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    <FiShoppingCart className="menu-icon" />
                    Ventas
                </NavLink>

                <NavLink
                    to="/prediccion"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    <FiBarChart2 className="menu-icon" />
                    Predicción
                </NavLink>

                <NavLink
                    to="/ajustes"
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

    );

}

export default Sidebar;