// components/TopNavBar.js
import React from 'react';
import { Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faMoon } from '@fortawesome/free-solid-svg-icons';
import './topNavBar.css'; // Import custom CSS for additional styles

const TopNavBar = () => {
    // Mock data for notifications
    const notificationsCount = 3;

    return (
        <Navbar expand="lg" className="top-navbar">
            <Navbar.Brand href="#home">Your Company</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="ml-auto nav-icons">
                    <NavDropdown alignLeft
                        title={<FontAwesomeIcon icon={faUserCircle} size="lg" />} id="basic-nav-dropdown">
                        <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#logout">Logout</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="#theme" className="nav-icon">
                        <FontAwesomeIcon icon={faMoon} size="lg" />
                    </Nav.Link>
                    <Nav.Link href="#notifications" className="nav-icon">
                        <FontAwesomeIcon icon={faBell} size="lg" />
                        {notificationsCount > 0 && (
                            <Badge pill variant="danger" className="notification-badge">
                                {notificationsCount}
                            </Badge>
                        )}
                    </Nav.Link>

                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default TopNavBar;
