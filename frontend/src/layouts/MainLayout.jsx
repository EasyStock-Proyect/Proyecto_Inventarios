import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/auth.service";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import MessageBox from "../components/MessageBox/MessageBox";

import "./MainLayout.css";

function MainLayout() {

    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {

        const loadUser = async () => {

            try {

                const data = await getCurrentUser();
                setUser(data);

            } catch (error) {

                console.error(
                    "Error cargando usuario:",
                    error
                );

            }

        };

        loadUser();

    }, []);

    const hasIncompleteProfile = useMemo(() => {
        if (!user) {
            return false;
        }

        return ["fullName", "address"].some(
            (field) => !String(user[field] ?? "").trim()
        );
    }, [user]);

    return (

        <div className="layout">

            <Sidebar
                user={user}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            <div className="layout-main">

                <Topbar
                    user={user}
                    setUser={setUser}
                    setIsMenuOpen={setIsMenuOpen}
                />

                <main className="layout-content">
                    {hasIncompleteProfile && (
                        <MessageBox
                            title="Completa tu perfil"
                            message="Faltan datos importantes de tu negocio para terminar la configuración de tu cuenta."
                            buttonLabel="Completar perfil"
                            onClick={() => navigate("/ajustes")}
                        />
                    )}

                    <Outlet
                        key={user?.id ?? "loading-user"}
                        context={{ user, setUser }}
                    />
                </main>

            </div>

        </div>

    );

}


export default MainLayout;