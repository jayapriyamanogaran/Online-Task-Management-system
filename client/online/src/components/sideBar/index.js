// components/SideNavBar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTasks, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './sideBar.css'; // Import custom CSS for additional styles
import { Route, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../Router/routes';


const SideNavBar = () => {
    const navigate = useNavigate()
    return (
        <div className="side-navbar">
            <Nav className="flex-column">
                <Nav.Link onClick={() => false}>
                    <FontAwesomeIcon icon={faHome} />
                    Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate(AppRoutes.projects)}>
                    <FontAwesomeIcon icon={faTasks} />
                    Projects
                </Nav.Link>
                <Nav.Link onClick={() => navigate(AppRoutes.employees)}>
                    <FontAwesomeIcon icon={faTasks} />
                    Employees
                </Nav.Link>
                <Nav.Link onClick={() => navigate(AppRoutes.tasks)}>
                    <FontAwesomeIcon icon={faTasks} />
                    Tasks
                </Nav.Link>
                <Nav.Link href="#settings">
                    <FontAwesomeIcon icon={faCog} />
                    Settings
                </Nav.Link>
                <Nav.Link onClick={() => {
                    localStorage.clear()
                    navigate(AppRoutes.login)
                }}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default SideNavBar;
