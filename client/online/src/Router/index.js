import React, { Suspense } from "react";
import {
    Routes,
    Route,
    BrowserRouter,
} from "react-router-dom";
import { AppRoutes } from "./routes";
import PrivateRouter from "./privateRouter";

const Login = React.lazy(() => import("./../screens/login/index"));
const Tasks = React.lazy(() => import("./../screens/task/index"));
const Projects = React.lazy(() => import("./../screens/project/index"));
const Employee = React.lazy(() => import("./../screens/employees/index"));
const PasswordResetScreen = React.lazy(() => import("./../screens/resetPassword/index"));
const TaskDoubts = React.lazy(() => import("./../screens/taskDoubts/index"));
const Notification = React.lazy(() => import("./../screens/notification/index"));
const MyProfile = React.lazy(() => import("./../screens/myProfile/index"));
const DashboardScreen = React.lazy(() => import("./../screens/dashboard/index"));




const RouterApp = (props) => {




    return (
        <Suspense>
            <BrowserRouter>
                <Routes>

                    {/* Home Route */}



                    {/* Login Route */}
                    <Route path={AppRoutes.login} element={<Login />} />
                    <Route path={AppRoutes.resetPassword} element={<PasswordResetScreen />} />

                    <Route path={AppRoutes.tasks} element={
                        <PrivateRouter path={AppRoutes.tasks}>
                            <Tasks />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.tasksDoubts} element={
                        <PrivateRouter path={AppRoutes.tasksDoubts}>
                            <TaskDoubts />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.projects} element={
                        <PrivateRouter path={AppRoutes.projects}>
                            <Projects />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.employees} element={
                        <PrivateRouter path={AppRoutes.employees}>
                            <Employee />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.notification} element={
                        <PrivateRouter path={AppRoutes.notification}>
                            <Notification />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.myProfile} element={
                        <PrivateRouter path={AppRoutes.myProfile}>
                            <MyProfile />
                        </PrivateRouter>
                    } />

                    <Route path={AppRoutes.dashboard} element={
                        <PrivateRouter path={AppRoutes.dashboard}>
                            <DashboardScreen />
                        </PrivateRouter>
                    } />



                </Routes>
            </BrowserRouter>
        </Suspense>

    );
};

export default RouterApp;
