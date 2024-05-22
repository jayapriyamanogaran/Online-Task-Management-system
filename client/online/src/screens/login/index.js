import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import TextBox from '../../components/textBox';
import Button from '../../components/button';
import './login.css'; // Import custom CSS for LoginScreen styling

const LoginScreen = () => {
    const initialState = {
        email: "",
        password: "",
        isLoad: false,
        error: {
            email: "",
            password: ""
        }
    }

    const [data, setData] = useState({ ...initialState });
    const updateState = (value, key) => {
        let error = data.error;
        error[key] = "";
        setData({ ...data, [key]: value, error });
    };

    const validate = () => {
        var isValid = true;
        const error = data?.error;
        if (data?.email.length === 0) {
            isValid = false;
            error.email = "email is Required";
        }
        if (data?.password.length === 0) {
            isValid = false;
            error.password = "password  is Required";
        }

        setData({ ...data, error });
        return isValid;
    };
    const handleLogin = async () => {
        updateState(true, "isLoad")
        if (validate()) {
            try {
                // Sample Axios network call to login API
                const response = await axios.post('https://example.com/login', {
                    email: data?.email,
                    password: data?.password,
                });
                setData({ ...initialState })

                console.log(response.data); // Handle response data
            } catch (error) {
                setData({ ...initialState })
                console.error('Login failed:', error.message);
            }
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
                                controlId="formBasicEmail"
                                label="Email address"
                                placeholder="Enter email"
                                value={data?.email}
                                onChange={(e) => updateState(e.target.value, "email")}
                                passwordError={data?.error?.email?.length > 0 ? data?.error?.email : null}
                            />
                        </Col>
                        <Col xs={12} >
                            <TextBox
                                controlId="formBasicPassword"
                                label="Password"
                                type="password"
                                placeholder="Password"
                                value={data?.password}
                                onChange={(e) => updateState(e.target.value, "password")}
                                passwordError={data?.error?.password?.length > 0 ? data?.error?.password : null}

                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} >
                            <Button variant="primary" block onClick={handleLogin}
                                disabled={data?.isLoad}
                            >
                                Login
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default LoginScreen;
