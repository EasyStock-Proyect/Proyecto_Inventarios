import "./Register.css"

import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Tabs from "../../components/Tabs/Tabs";
import PasswordInput from "../../components/PasswordInputs/PasswordInput";
import Footer from "../../components/Footer/Footer";
import AuthLink from "../../components/AuthLink/AuthLink";

function Register(){
    return(
        <div className="register-container">
            <div className="register-wrapper">
                <Logo/>
                <div className="register-card">
                    <Tabs/>
                    <Input
                        type="text"
                        placeholder="Nombre del negocio"
                    />
                    <Input
                        type="email"
                        placeholder="Correo electronico"
                    />
                    <PasswordInput/>
                    <div className="password-menssage">
                        Crea una contraseña de 6 caracteres minimos
                    </div>
                    <PasswordInput/>
                    <div className="password-menssage">
                        Confirma contraseña
                    </div>
                    <Button>
                        Crear cuenta
                    </Button>
                    <AuthLink
                        text="¿Ya tienes cuenta?"
                        linkText="Ingresar"
                    />
                </div>
                <Footer/>
            </div>
        </div>
    )
}

export default Register;