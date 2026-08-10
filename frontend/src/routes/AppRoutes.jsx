import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";

// Páginas pendientes
import Inventory from "../pages/Inventory/Inventory";
import Sales from "../pages/Sales/Sales";
import Prediction from "../pages/Prediction/Prediction";
import Settings from "../pages/Settings/Settings";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

function AppRouter() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route element={<ProtectedRoute />}>

                        <Route element={<MainLayout />}>

                            <Route
                                path="/dashboard"
                                element={<Dashboard />}
                            />

                            <Route
                                path="/inventario"
                                element={<Inventory />}
                            />

                            <Route
                                path="/ventas"
                                element={<Sales />}
                            />

                            <Route
                                path="/prediccion"
                                element={<Prediction />}
                            />

                            <Route
                                path="/ajustes"
                                element={<Settings />}
                            />

                        </Route>

                    </Route>

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );

}

export default AppRouter;