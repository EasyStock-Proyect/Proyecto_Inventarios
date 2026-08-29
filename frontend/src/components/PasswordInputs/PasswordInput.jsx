import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUnlock } from "react-icons/fi";
import "./PasswordInput.css"

function PasswordInput({ value, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
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
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
                {showPassword ? (
                    <FiUnlock className="password-icon" />
                ) : (
                    <FiLock className="password-icon" />
                )}
                {showPassword ? (
                    <FiEyeOff className="password-visibility-icon" />
                ) : (
                    <FiEye className="password-visibility-icon" />
                )}
            </button>
        </div>
    );
}

export default PasswordInput;