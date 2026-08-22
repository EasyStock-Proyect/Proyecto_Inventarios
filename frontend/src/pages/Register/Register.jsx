import "./Register.css"

import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Tabs from "../../components/Tabs/Tabs";
import PasswordInput from "../../components/PasswordInputs/PasswordInput";
import Footer from "../../components/Footer/Footer";
import AuthLink from "../../components/AuthLink/AuthLink";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { register } from "../../api/auth";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

function Register() {

    const [text, setText] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confiPassword, setConfiPassword] = useState("");

    const [serverError, setServerError] = useState("");
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
    const navigate = useNavigate();

    const [errors, setErrors] = useState({
        text: "",
        businessType: "",
        email: "",
        password: "",
        confiPassword: ""
    });

    const validacionForm = () => {

        const newErrors = {
            text: "",
            businessType: "",
            email: "",
            password: "",
            confiPassword: ""
        };

        let isValid = true;

        if (!text.trim()) {
            newErrors.text = "El nombre del negocio es obligatorio.";
            isValid = false;
        }

        if (!businessType.trim()) {
            newErrors.businessType = "El tipo de negocio es obligatorio.";
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = "El correo es obligatorio.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Ingrese un correo válido.";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "La contraseña es obligatoria.";
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = "La contraseña debe tener mínimo 8 caracteres.";
            isValid = false;
        }

        if (!confiPassword.trim()) {
            newErrors.confiPassword = "Confirme la contraseña.";
            isValid = false;
        } else if (confiPassword !== password) {
            newErrors.confiPassword = "Las contraseñas no coinciden.";
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    const handleRegister = async () => {

        if (!validacionForm()) {
            return;
        }

        try {

            setServerError("");

            const response = await register({
                businessName: text,
                businessType,
                email,
                password
            });

            console.log(response.data);
            setShowRegisterSuccess(true);

        } catch (error) {

            setServerError(
                error.response?.data?.message ||
                error.message ||
                "Error al registrar el usuario."
            );

        }
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">

                <Logo />

                <form className="register-card" onSubmit={(event) => {
                    event.preventDefault();
                    void handleRegister();
                }}>

                    <Tabs active="register" />

                    <Input
                        type="text"
                        placeholder="Nombre del negocio"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />


                    {errors.text && (
                        <p className="error-message">
                            {errors.text}
                        </p>
                    )}

                    <Input
                        type="text"
                        placeholder="Tipo de negocio"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                    />

                    {errors.businessType && (
                        <p className="error-message">
                            {errors.businessType}
                        </p>
                    )}

                    <Input
                        type="email"
                        placeholder="Correo electrónico"
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
                        Crea una contraseña de mínimo 8 caracteres
                    </div>

                    <PasswordInput
                        value={confiPassword}
                        onChange={(e) => setConfiPassword(e.target.value)}
                    />

                    {errors.confiPassword && (
                        <p className="error-message">
                            {errors.confiPassword}
                        </p>
                    )}

                    <div className="password-menssage">
                        Confirma la contraseña
                    </div>

                    <div className="button-container">
                        <Button type="submit">
                            Crear cuenta
                        </Button>
                    </div>

                    {serverError && (
                        <div className="server-error">
                            {serverError}
                        </div>
                    )}

                    <AuthLink
                        text="¿Ya tienes cuenta?"
                        linkText="Ingresar"
                    />

                    <ConfirmDialog
                        open={showRegisterSuccess}
                        type="success"
                        title="Registro exitoso"
                        message="Usuario registrado correctamente."
                        confirmText="Continuar"
                        cancelText=""
                        onCancel={() => setShowRegisterSuccess(false)}
                        onConfirm={() => {
                            setShowRegisterSuccess(false);
                            navigate("/login", {
                                state: {
                                    success: "Usuario registrado correctamente."
                                }
                            });
                        }}
                    />

                </form>

                <Footer />

            </div>
        </div>
    );
}

export default Register;