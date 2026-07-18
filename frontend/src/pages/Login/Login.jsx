import "./Login.css";
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Tabs from "../../components/Tabs/Tabs";
import PasswordInput from "../../components/PasswordInputs/PasswordInput";

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
                    <PasswordInput/>
                    <div className="button-container">
                        <Button>
                            Iniciar sesión
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;