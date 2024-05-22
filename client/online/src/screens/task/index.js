import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TableComponent from '../../components/table';
import Button from '../../components/button';
import SelectDialog from '../../components/dialog';
import TextBox from '../../components/textBox';
import axios from 'axios';
import CombinedNavBar from '../../Hocs';

const TaskScreen = () => {
    const initialState = {
        task: "",
        startDate: "",
        enDate: "",
        description: "",
        search: "",
        error: {
            task: "",
            startDate: "",
            enDate: "",
            description: "",
            search: ""
        }
    }
    const [data, setData] = useState({ ...initialState });
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [listData, setListData] = useState([]);
    const updateState = (value, key) => {
        let error = data.error;
        error[key] = "";
        setData({ ...data, [key]: value, error });
    };

    const validate = () => {
        var isValid = true;
        const error = data?.error;
        if (data?.task.length === 0) {
            isValid = false;
            error.task = "task name is Required";
        }
        if (data?.description.length === 0) {
            isValid = false;
            error.description = "description  is Required";
        }
        if (data?.startDate.length === 0) {
            isValid = false;
            error.startDate = "startDate  is Required";
        }
        if (data?.enDate.length === 0) {
            isValid = false;
            error.enDate = "enDate  is Required";
        }

        setData({ ...data, error });
        return isValid;
    };


    const handleAdd = async () => {
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

    // Fetch data from API on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch data from API
        // Update 'data' state with fetched data
        // setData("");
    };

    const handleAddClick = () => {
        setShowAddDialog(true);
    };

    const handleFilterClick = () => {
        setShowFilterDialog(true);
    };
    const handleAction = (action, row) => {
        switch (action) {
            case 'view':
                // Handle view action
                break;
            case 'edit':
                // Handle edit action
                break;
            case 'delete':
                // Handle delete action
                break;
            default:
                break;
        }
    };

    const columns = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Role', key: 'role' }
    ];
    const ll = [
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
        { name: "gokul", email: "djnfjnjfjf", role: "manager" },
    ]
    return (
        <Container>
            <Row className='justify-content-between'>
                <Col md={6}>
                    <h2>Tasks</h2>
                    {/* Search box */}
                    <TextBox
                        label="Search"
                        placeholder="Enter search text"
                        value={data?.search}
                        onChange={(e) => updateState(e.target.value, "search")}
                    />
                    {/* Table component */}
                </Col>
                <Col md={6} className="text-end">
                    {/* Filter icon */}
                    <i className="fa fa-filter" onClick={handleFilterClick}></i>
                    {/* Add button */}
                    <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add</Button>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TableComponent columns={columns} data={ll} onAction={handleAction} />

                </Col>
            </Row>
            {/* Add dialog */}
            <SelectDialog show={showAddDialog} onClose={() => setShowAddDialog(false)} />
            {/* Filter select dialog */}
            <SelectDialog show={showFilterDialog} onClose={() => setShowFilterDialog(false)} />
        </Container>
    );
};

export default CombinedNavBar(TaskScreen);
