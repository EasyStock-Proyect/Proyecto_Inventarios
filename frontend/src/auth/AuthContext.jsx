import { createContext, useContext, useEffect, useState } from "react";

import { setAccessToken, clearAccessToken } from "./tokenManager";
import { restoreSession } from "./auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const initializeAuth = async () => {

            try {

                const success = await restoreSession();

                if (success) {
                    setAuthenticated(true);
                } else {
                    clearAccessToken();
                    setAuthenticated(false);
                }

            } catch (error) {

                console.error(
                    "Error restaurando sesión:",
                    error
                );

                clearAccessToken();
                setAuthenticated(false);

            } finally {

                setLoading(false);

            }

        };

        initializeAuth();

    }, []);

    const loginUser = (accessToken) => {

        setAccessToken(accessToken);
        setAuthenticated(true);

    };

    const logoutUser = () => {

        clearAccessToken();
        setAuthenticated(false);

    };

    return (

        <AuthContext.Provider
            value={{
                authenticated,
                loading,
                loginUser,
                logoutUser
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}