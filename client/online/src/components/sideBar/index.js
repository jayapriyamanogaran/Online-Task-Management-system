// components/SideNavBar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTasks, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './sideBar.css'; // Import custom CSS for additional styles

const SideNavBar = () => {
    return (
        <div className="side-navbar">
            <Nav className="flex-column">
                <Nav.Link href="#dashboard">
                    <FontAwesomeIcon icon={faHome} />
                    Dashboard
                </Nav.Link>
                <Nav.Link href="#projects">
                    <FontAwesomeIcon icon={faTasks} />
                    Projects
                </Nav.Link>
                <Nav.Link href="#tasks">
                    <FontAwesomeIcon icon={faTasks} />
                    Tasks
                </Nav.Link>
                <Nav.Link href="#settings">
                    <FontAwesomeIcon icon={faCog} />
                    Settings
                </Nav.Link>
                <Nav.Link href="#logout">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default SideNavBar;
