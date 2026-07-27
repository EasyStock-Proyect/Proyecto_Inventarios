import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout() {
    return (
        <div className="layout">

            <Sidebar />

            <main className="layout-content">
                <Outlet />
            </main>

        </div>
    );
}

export default MainLayout;