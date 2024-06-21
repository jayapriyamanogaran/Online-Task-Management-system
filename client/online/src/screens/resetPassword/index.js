import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import TextBox from '../../components/textBox';
import Button from '../../components/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css'; // Import custom CSS for LoginScreen styling
import { AppRoutes } from '../../Router/routes';
import { useNavigate } from 'react-router-dom';

const PasswordResetScreen = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate()

    const handleSendOTP = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/send-otp', { email });
            toast.success('OTP sent successfully!');
        } catch (error) {
            toast.error('Failed to send OTP. Please try again.');
            console.error('Error sending OTP:', error.message);
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/reset-password', { email, otp, newPassword });
            toast.success('Password reset successful!');
            navigate(AppRoutes.login)
            // Redirect or navigate to login screen
        } catch (error) {
            toast.error('Failed to reset password. Please try again.');
            console.error('Error resetting password:', error.message);
        }
    };

    return (
        <div className="login-screen-container">
            <div className="login-form">
                <h2 className="login-heading">Login</h2>
                <Form>
                    <Row>
                        <Col xs={12} >
                            <TextBox
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </Col>

                        <Col xs={12} > <Button variant="primary" onClick={handleSendOTP} disabled={email?.length === 0}>
                            Send OTP
                        </Button></Col>
                        <Col xs={12} >
                            <TextBox
                                label="OTP"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                            />
                        </Col>
                        <Col xs={12} >
                            <TextBox
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </Col>
                    </Row>
                    <br />

                    <Row>
                        <Col xs={12} >
                            <Button variant="primary" onClick={handleResetPassword} >
                                Reset Password
                            </Button>

                        </Col>
                    </Row>
                </Form>

            </div>
        </div>
    );
};

export default PasswordResetScreen;
