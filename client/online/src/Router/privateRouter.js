import React from "react";
import { Navigate } from "react-router-dom";
import { LocalStorageKeys } from "../utils/constants";
import { AppRoutes } from "./routes";

const PrivateRoute = ({ path, children, ...rest }) => {
    const Access = (userRole, path) => {
        switch (userRole) {
            case "role":
                return [
                    ...Object.values(AppRoutes)
                ].indexOf(path)
            default:
                return false
        }
    }
    const isAuthenticated = (path) => {
        if (localStorage.getItem(LocalStorageKeys.authToken)) {
            const _ = Access("role", path);
            if (_ >= 0) {
                return true;
            };
            return false;
        } else {
            return false;
        }
    };

    return (
        <>
            {
                isAuthenticated(path) ? children : (
                    <Navigate
                        to={AppRoutes.login}
                        state={{ from: path }}
                    />
                )
            }
        </>
    );
};

export default PrivateRoute;
