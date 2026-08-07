import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/auth.service";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";


import "./MainLayout.css";

function MainLayout() {


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
                    <Outlet />
                </main>

            </div>

        </div>

    );

}


export default MainLayout;