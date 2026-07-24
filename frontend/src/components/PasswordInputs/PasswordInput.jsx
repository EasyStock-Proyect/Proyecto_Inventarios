import { useState } from "react";
import "./PasswordInput.css"
import open from "../../assets/icons/candado-abierto.webp"
import close from "../../assets/icons/candado-cerrado.webp"

function PasswordInput({value, onChange}) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
        <div className="password-input">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={value}
                onChange={onChange}
            />
            <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
            >
                <img
                    src={!showPassword ? close : open}
                    alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="password-icon"
                />
            </button>
        </div>
        </>
    );
}
export default PasswordInput;