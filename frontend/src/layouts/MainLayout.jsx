import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

import "./MainLayout.css";

function MainLayout() {
    return (
        <div className="layout">

            <Sidebar />

            <div className="layout-main">

                <Topbar />

                <main className="layout-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default MainLayout;