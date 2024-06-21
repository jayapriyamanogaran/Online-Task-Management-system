import React, { Suspense } from "react";
import {
    Routes,
    Route,
    BrowserRouter,
} from "react-router-dom";
import { AppRoutes } from "./routes";
import PrivateRouter from "./privateRouter";
import PasswordResetScreen from "../screens/resetPassword";




// const Home = React.lazy(() => import("./../screens/home/home"))

const Login = React.lazy(() => import("./../screens/login/index"))
const Tasks = React.lazy(() => import("./../screens/task/index"))
const Projects = React.lazy(() => import("./../screens/project/index"))
const Employee = React.lazy(() => import("./../screens/employees/index"))




const RouterApp = (props) => {




    return (
        <Suspense>
            <BrowserRouter>
                <Routes>

                    {/* Home Route */}

                    {/* <Route path={AppRoutes.home} element={
                        <PrivateRouter path={AppRoutes.home}>
                            <Home />
                        </PrivateRouter>
                    } /> */}

                    {/* Login Route */}
                    <Route path={AppRoutes.login} element={<Login />} />
                    <Route path={AppRoutes.tasks} element={<Tasks />} />
                    <Route path={AppRoutes.projects} element={<Projects />} />
                    <Route path={AppRoutes.employees} element={<Employee />} />
                    <Route path={AppRoutes.resetPassword} element={<PasswordResetScreen />} />


                </Routes>
            </BrowserRouter>
        </Suspense>

    );
};

export default RouterApp;
