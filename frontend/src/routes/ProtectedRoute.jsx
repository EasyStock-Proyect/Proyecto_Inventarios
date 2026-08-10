import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function ProtectedRoute() {

    const {
        authenticated,
        loading
    } = useAuth();

    if (loading) {
        return null;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;

}

export default ProtectedRoute;