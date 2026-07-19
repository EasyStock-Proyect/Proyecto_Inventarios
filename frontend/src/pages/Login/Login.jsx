import "./Login.css";

import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Tabs from "../../components/Tabs/Tabs";
import PasswordInput from "../../components/PasswordInputs/PasswordInput";
import Footer from "../../components/Footer/Footer";
import AuthLink from "../../components/AuthLink/AuthLink";
function Login() {
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
                    />
                    <PasswordInput />
                    <div className="password-menssage">
                        Minimo 6 cracteres
                    </div>
                    <div className="button-container">
                        <Button>
                            Iniciar sesión
                        </Button>
                    </div>
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