import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import TableComponent from '../../components/table';
import Button from '../../components/button';
import SelectDialog from '../../components/dialog';
import TextBox from '../../components/textBox';
import CombinedNavBar from '../../Hocs';
import FormGenerator from '../../components/formGenerator';
import { NetWorkCallMethods, NetworkCall } from '../../networkCall';
import { config } from '../../utils/config';
import { LocalStorageKeys, UseDebounce, toShow, transformObjectsArray } from '../../utils/constants';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './profile.css'; // Import custom CSS for LoginScreen styling
import moment from 'moment';
const MyProfileScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem(LocalStorageKeys.user))



    return (
        <Container>
            <Row>
                <Col md={6}>
                    <h2>My Profile</h2>
                </Col>

                <Col md={12}>
                    <Card key={user?.id} className={`mb-3 custom-card 'read-notification' }`}>
                        <Card.Body>
                            <Card.Text><strong>ID:</strong> {user?.id}</Card.Text>
                            <Card.Text><strong>Name:</strong> {user?.name}</Card.Text>
                            <Card.Text><strong>Email:</strong> {user?.email_id}</Card.Text>
                            <Card.Text><strong>Mobile:</strong> {user?.phone_no}</Card.Text>
                            <Card.Text><strong>Role:</strong> {user?.role}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );

};

export default CombinedNavBar(MyProfileScreen);
