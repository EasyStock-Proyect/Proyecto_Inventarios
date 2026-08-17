import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

import { setAccessToken, clearAccessToken } from "./tokenManager";

import {
    restoreSession,
    logout
} from "./auth.service";

export function AuthProvider({ children }) {

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const isMountedRef = useRef(true);

    useEffect(() => {

        let isActive = true;

        const initializeAuth = async () => {

            try {

                const success = await restoreSession();

                if (!isActive) {
                    return;
                }

                if (success) {
                    setAuthenticated(true);
                } else {
                    clearAccessToken();
                    setAuthenticated(false);
                }

            } catch (error) {

                if (!isActive) {
                    return;
                }

                console.error(
                    "Error restaurando sesión:",
                    error
                );

                clearAccessToken();
                setAuthenticated(false);

            } finally {

                if (isActive) {
                    setLoading(false);
                }

            }

        };

        initializeAuth();

        return () => {
            isActive = false;
            isMountedRef.current = false;
        };

    }, []);

    const loginUser = (accessToken) => {

        setAccessToken(accessToken);
        setAuthenticated(true);
        setLoading(false);

    };

    const logoutUser = async () => {

        await logout();

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
