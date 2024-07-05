import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { NetWorkCallMethods, NetworkCall } from '../../networkCall';
import { config } from '../../utils/config';
import { LocalStorageKeys, toShow } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import CombinedNavBar from '../../Hocs';
import "./dashboard.css"

const DashboardScreen = () => {
    const [data, setData] = useState({
        completed_projects: 0,
        completed_tasks: 0,
        high_priority_tasks: 0,
        inprogress_projects: 0,
        low_priority_tasks: 0,
        medium_priority_tasks: 0,
        not_completed_tasks: 0,
        read_notifications: 0,
        resolved_task_doubts: 0,
        not_resolved_task_doubts: 0,
        total_admin: 0,
        total_designer: 0,
        total_developer: 0,
        total_hr: 0,
        total_manager: 0,
        total_notifications: 0,
        total_projects: 0,
        total_task_doubts: 0,
        total_tasks: 0,
        unread_notifications: 0,
        users_profiles: 0,
        yet_to_start_projects: 0,
        // Add more fields here as needed
    });

    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        fetchData();
        // Determine greeting based on local time
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            setGreeting('Good morning');
        } else if (currentHour >= 12 && currentHour < 18) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
        }
    }, []);
    const user = JSON.parse(localStorage.getItem(LocalStorageKeys.user))
    const fetchData = () => {
        const payload = {
            user_profile_id: toShow() ? undefined : user?.id,
        };

        NetworkCall(`${config.apiUrl}dashboard`, NetWorkCallMethods.post, payload)
            .then((response) => {
                setData(response?.data || {

                    completed_projects: 0,
                    completed_tasks: 0,
                    high_priority_tasks: 0,
                    inprogress_projects: 0,
                    low_priority_tasks: 0,
                    medium_priority_tasks: 0,
                    not_completed_tasks: 0,
                    read_notifications: 0,
                    resolved_task_doubts: 0,
                    total_admin: 0,
                    total_designer: 0,
                    total_developer: 0,
                    total_hr: 0,
                    total_manager: 0,
                    total_notifications: 0,
                    total_projects: 0,
                    total_task_doubts: 0,
                    total_tasks: 0,
                    unread_notifications: 0,
                    users_profiles: 0,
                    yet_to_start_projects: 0,
                });
            })
            .catch((error) => {
                console.error('Error fetching Dashboard:', error);
            });
    };
    const projectStatusChartData = [
        { name: 'Completed Projects', value: data.completed_projects, fill: '#FF6384' }, // Red
        { name: 'In Progress Projects', value: data.inprogress_projects, fill: '#36A2EB' }, // Blue
        { name: 'Not Started Projects', value: data.yet_to_start_projects, fill: '#FFCE56' }, // Yellow
    ];

    const taskStatusChartData = [
        { name: 'Completed Tasks', value: data.completed_tasks, fill: '#4CAF50' }, // Green
        { name: 'In Progress Tasks', value: data.not_completed_tasks, fill: '#FFC107' }, // Amber
    ];

    const notificationStatusChartData = [
        { name: 'Read Notifications', value: data.read_notifications, fill: '#9C27B0' }, // Purple
        { name: 'UnRead Notifications', value: data.unread_notifications, fill: '#2196F3' }, // Indigo
    ];

    const taskDoubtsChartData = [
        { name: 'Resolved', value: data.resolved_task_doubts },
        { name: 'Not Resolved', value: data.not_resolved_task_doubts },
    ];

    const COLORS = ['#008000', '#FF4500'];
    return (
        <div style={{ height: `calc(100vh - 80px)`, overflow: "auto" }}>
            <Container className>
                <Row className="mt-4">
                    <Col>
                        <h2>{`${greeting}, ${user?.name}`}</h2>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col className="custom-col-2">
                        <Card className="gradient-card">
                            <Card.Body>
                                <Card.Title>{toShow() ? 'Total Employees' : 'Total Colleagues'}</Card.Title>
                                <Card.Text>{data.users_profiles}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={2}>
                        <Card className="gradient-card">
                            <Card.Body>
                                <Card.Title>Total Projects</Card.Title>
                                <Card.Text>{data.total_projects}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={2}>
                        <Card className="gradient-card">
                            <Card.Body>
                                <Card.Title>Total Tasks</Card.Title>
                                <Card.Text>{data.total_tasks}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col className="custom-col-2">
                        <Card className="gradient-card">
                            <Card.Body>
                                <Card.Title>Total Task Doubts</Card.Title>
                                <Card.Text>{data.total_task_doubts}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="gradient-card">
                            <Card.Body>
                                <Card.Title>Total Notifications</Card.Title>
                                <Card.Text>{data.total_notifications}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>


                {/* Charts */}
                <Row className="mt-4">
                    <Col md={6}>
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>{toShow() ? "Employees" : "Colleagues"}</Card.Title>
                                <BarChart
                                    width={500}
                                    height={300}
                                    data={[
                                        { value: data.total_admin, name: 'Admin', fill: '#8884d8' },
                                        { value: data.total_hr, name: 'HR', fill: '#83a6ed' },
                                        { value: data.total_manager, name: 'Manager', fill: '#8dd1e1' },
                                        { value: data.total_developer, name: 'Developer', fill: '#82ca9d' },
                                        { value: data.total_designer, name: 'Designer', fill: '#a4de6c' },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>Project Status</Card.Title>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={projectStatusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={15}
                                        fill="#8884d8"
                                        label
                                    />
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col md={6}>
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>Task Status</Card.Title>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={taskStatusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    />
                                    <Tooltip />
                                    <Legend />

                                </PieChart>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} >
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>Task Priorities</Card.Title>
                                <BarChart
                                    width={500}
                                    height={300}
                                    data={[
                                        { name: 'High Priority', value: data.high_priority_tasks, fill: '#82ca9d' }, // Green
                                        { name: 'Medium Priority', value: data.medium_priority_tasks, fill: '#8884d8' }, // Purple
                                        { name: 'Low Priority', value: data.low_priority_tasks, fill: '#ffc658' }, // Orange
                                    ]}

                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />

                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-4">

                    <Col md={6} >
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>Task Doubts</Card.Title>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={taskDoubtsChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                    >
                                        {taskDoubtsChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="custom-card">
                            <Card.Body>
                                <Card.Title>Notification Status</Card.Title>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={notificationStatusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                    >
                                        {notificationStatusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry?.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container >
        </div>
    );
};

export default CombinedNavBar(DashboardScreen);
