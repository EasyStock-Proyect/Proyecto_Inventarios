import "./Login.css";

import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Tabs from "../../components/Tabs/Tabs";
import PasswordInput from "../../components/PasswordInputs/PasswordInput";
import Footer from "../../components/Footer/Footer";
import AuthLink from "../../components/AuthLink/AuthLink";
import { useState } from "react";
import { login } from "../../api/auth";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [serverError, setServerError] = useState("");
    const location = useLocation();
    const successMessage = location.state?.success;
    const navigate = useNavigate();

    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });

    const validacionForm = () => {
        const newErrors = {
            email: "",
            password: ""
        };

        let isValid = true;

        if (!email.trim()) {
            newErrors.email = "El correo es obligatorio.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Por favor ingrese un correo válido.";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "La contraseña es obligatoria.";
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = "La contraseña es muy corta.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {

        if (!validacionForm()) {
            return;
        }

        try {

            setServerError("");

            const response = await login({
                email,
                password
            });

            localStorage.setItem(
                "accessToken",
                response.data.accesToken
            )
            navigate("/dashboard")

        } catch (error) {

            setServerError(
                error.response?.data?.message ||
                error.message ||
                "Error al iniciar sesión."
            )
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="logo-card">
                    <Logo />
                </div>

                <div className="login-card">
                    <Tabs active="login" />

                    <Input
                        type="email"
                        placeholder="correo electronico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                        <p className="error-message">
                            {errors.email}
                        </p>
                    )}
                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && (
                        <p className="error-message">
                            {errors.password}
                        </p>
                    )}

                    <div className="password-menssage">
                        Minimo 8 caracteres
                    </div>
                    <div className="button-container">
                        <Button onClick={handleLogin}>
                            Iniciar sesión
                        </Button>
                    </div>

                    {serverError && (
                        <div className="server-error">
                            {serverError}
                        </div>
                    )}
                    <AuthLink
                        text="¿No tienes cuenta?"
                        linkText="Crear cuenta"
                    />
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default Login;