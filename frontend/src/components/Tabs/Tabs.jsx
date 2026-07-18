import { useState } from "react";
import "./Tabs.css";

function Tabs() {

    const [activeTab, setActiveTab] = useState("login");

    return (
        <div className="tabs">
            <button className={`tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
                Ingresar
            </button>

            <button className={`tab ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")}>
                Crear cuenta
            </button>
        </div>
    );
}

export default Tabs;