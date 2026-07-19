import "./Logo.css"

import logo from "../../assets/logo/logo_3.webp"

function Logo() {
    return (
        <div className="logo">
            <div className="logo-circle">
                <img
                    src={logo}
                    alt="EasyStock"
                    className="logo-image"
                />
            </div>
            <h1 className="logo-title">
                EasyStock
            </h1>
            <p className="logo-subtitle">
                Gestión inteligente para tu negocio
            </p>
        </div>
    );
}

export default Logo;