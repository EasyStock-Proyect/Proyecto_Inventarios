import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";

function AppRouter(){
    return(
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login"/>}
                />
                <Route 
                    path="/login"
                    element={<Login/>}
                />
                <Route
                    path="/register"
                    element={<Register/>}
                />
                <Route
                    path="dashboard"
                    element={<Dashboard/>}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;