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
import './notification.css'; // Import custom CSS for LoginScreen styling
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../Router/routes';
const NotificationScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem(LocalStorageKeys.user))
    const navigate = useNavigate()
    useEffect(() => {
        fetchNotification()
    }, []);
    const fetchNotification = () => {
        const payload = {
            user_profile_id: toShow() ? undefined : user?.id,
            is_common: toShow() ? true : undefined,
        }
        // Fetch notifications from API
        NetworkCall(`${config.apiUrl}notifications`, NetWorkCallMethods.post, payload)
            .then((response) => {
                setNotifications(response?.data);
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            });
    }
    const initialState = {
        id: "",
        name: "",
        description: "",
        // Assuming you'll manage user assignment
        isEdit: false,
        isView: false,
        error: {
            name: "",
            description: "",

        }
    };

    const [data, setData] = useState({ ...initialState });
    const [showAddDialog, setShowAddDialog] = useState(false);




    // Update state on input change
    const updateState = (value, key) => {
        setData({
            ...data,
            [key]: value,
            error: {
                ...data?.error,
                [key]: "", // Clear error when value changes
            }
        });
    };
    // Validation function for form fields
    const validate = () => {
        let isValid = true;
        const error = { ...data?.error };

        if (data?.name?.trim() === "") {
            isValid = false;
            error.name = "Name is required";
        }

        if (data?.description?.trim() === "") {
            isValid = false;
            error.description = "Description is required";
        }




        setData({ ...data, error });
        return isValid;
    };

    //debounce hook

    // Handle add button click
    const handleAddClick = () => {
        setShowAddDialog(true);
    };





    // Fetch initial data from API on component mount

    console.log(data, "///");
    // Fetch data function


    // Handle form submission for adding new employee
    const handleAdd = () => {
        if (validate()) {
            const payload = {
                id: data?.id ?? undefined,
                name: data?.name,
                description: data?.description,
                notification_status: "All",
            }
            // Sample Axios call to add new employee
            NetworkCall(`${config.apiUrl}notification/upsert`, NetWorkCallMethods.post, payload
            ).then((res) => {
                setData({ ...initialState }); // Reset form data after successful submission
                setShowAddDialog(false); // Close dialog after successful submission
                toast.success('Notification added succeessfully!', { autoClose: 2000 });
                fetchNotification()

                console.log('Notifiation added:', res.data);
            }).catch((error) => {
                toast.error('Network error occurred!', { autoClose: 2000 });

                console.error('Error adding employee:', error);
            })




        }
    };

    // Define form fields for FormGenerator component
    const fields = [
        {
            type: 'text',
            label: 'Name',
            value: data?.name,
            onChange: (value) => updateState(value, 'name'),
            required: true,
            error: data?.error?.name,
            disabled: data?.isView ? true : false
        },
        {
            type: 'text',
            label: 'Description',
            value: data?.description,
            onChange: (value) => updateState(value, 'description'),
            required: true,
            error: data?.error?.description,
            disabled: data?.isView ? true : false
        },

        // Add projectId and assignedId fields if needed (e.g., select or autocomplete)
    ];

    const handleClick = (notification) => {
        const payload = {
            id: notification?.id,
            is_read: true
        }
        // Sample Axios call to add new employee
        NetworkCall(`${config.apiUrl}notification/upsert`, NetWorkCallMethods.post, payload
        ).then((res) => {
            if (notification?.notification_status === "tasks") {
                navigate(AppRoutes.tasks)
            }
            if (notification?.notification_status === "tasks_doubts") {
                navigate(AppRoutes.tasksDoubts)

            }
            if (notification?.notification_status === "projects") {
                navigate(AppRoutes.projects)

            } else {
                fetchNotification()
            }
        }).catch((error) => {
            console.log(error);
        })

    }
    return (
        <Container>
            <Row>
                <Col md={6}>
                    <h2>Notifications</h2>
                </Col>
                {toShow() &&
                    <Col md={6} className="text-end">
                        {/* Add button */}
                        <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add Notification</Button>
                    </Col>
                }
                <Col md={12}>
                    {notifications?.map((notification) => (
                        <Card onClick={() => handleClick(notification)} key={notification?.id} className={`mb-3 custom-card ${notification?.is_read ? 'read-notification' : 'unread-notification'}`}>
                            <Card.Body>
                                <Card.Title>{notification?.name}</Card.Title>
                                <Card.Text>{notification?.description}</Card.Text>
                                <Card.Text>
                                    <strong>Status:</strong> {notification?.notification_status === "All" ? "Announcement" : notification?.notification_status}<br />
                                    <strong>Date:</strong> {moment(notification?.notification_date).format("DD MMM YYYY HH:SS a")}<br />
                                    <strong>Read:</strong> {notification?.is_read ? 'Yes' : 'No'}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>
            </Row>
            {/* Add dialog */}
            <SelectDialog
                show={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                Body={
                    <FormGenerator
                        fields={fields}
                        onSubmit={handleAdd}
                        className="my-form-container"
                        hideBtn={data?.isView}
                    />
                }
            />
        </Container>
    );

};

export default CombinedNavBar(NotificationScreen);
