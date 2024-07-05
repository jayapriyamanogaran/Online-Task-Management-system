// components/TopNavBar.js
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faMoon } from '@fortawesome/free-solid-svg-icons';
import './topNavBar.css'; // Import custom CSS for additional styles
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../Router/routes';
import { NetWorkCallMethods, NetworkCall } from '../../networkCall';
import { LocalStorageKeys, toShow } from '../../utils/constants';
import { config } from '../../utils/config';

const TopNavBar = () => {
    // Mock data for notifications
    const [notifications, setNotifications] = useState(0);
    const user = JSON.parse(localStorage.getItem(LocalStorageKeys.user))

    useEffect(() => {
        const payload = {
            user_profile_id: toShow() ? undefined : user?.id,
            is_common: toShow() ? true : undefined,
        }
        // Fetch notifications from API
        NetworkCall(`${config.apiUrl}notifications`, NetWorkCallMethods.post, payload)
            .then((response) => {
                setNotifications(response?.data?.[0]?.totalCount);
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            });
    }, []);
    const navigate = useNavigate()

    return (
        <Navbar expand="lg" className="top-navbar">
            <Navbar.Brand href="#home">Your Company</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="ml-auto nav-icons">
                    <NavDropdown alignLeft
                        title={<FontAwesomeIcon icon={faUserCircle} size="lg" />} id="basic-nav-dropdown">
                        <NavDropdown.Item onClick={() => navigate(AppRoutes.myProfile)} >My Profile</NavDropdown.Item>
                    </NavDropdown>

                    <Nav.Link onClick={() => navigate(AppRoutes.notification)} className="nav-icon">
                        <FontAwesomeIcon icon={faBell} size="lg" />
                        {notifications > 0 && (
                            <Badge pill variant="danger" className="notification-badge">
                                {notifications}
                            </Badge>
                        )}
                    </Nav.Link>

                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default TopNavBar;
