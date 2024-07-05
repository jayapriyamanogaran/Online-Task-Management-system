import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TableComponent from '../../components/table';
import Button from '../../components/button';
import SelectDialog from '../../components/dialog';
import TextBox from '../../components/textBox';
import axios from 'axios';
import CombinedNavBar from '../../Hocs';
import FormGenerator from '../../components/formGenerator';
import { NetWorkCallMethods, NetworkCall } from '../../networkCall';
import { config } from '../../utils/config';
import { LocalStorageKeys, UseDebounce, toShow, transformObjectsArray } from '../../utils/constants';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskDoubtScreen = () => {
    const userId = JSON.parse(localStorage.getItem(LocalStorageKeys.user))
    const initialState = {
        id: "",
        task_id: "",
        user_id: "",
        doubt_message: "",
        resolved: false,
        resolved_by: "",
        raised_date: null,
        resolved_date: null,
        isEdit: false,
        isView: false,
        error: {
            task_id: "",
            user_id: "",
            doubt_message: "",
            resolved_by: ""
        }
    };

    const [doubts, setDoubts] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [projects, setProjects] = useState([]); // Assuming this will hold fetched project data

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(5);
    const [employeeOptions, setEmployeeOptions] = useState([]);

    const [searchValue, setSearchValue] = React.useState('');
    const [formData, setFormData] = useState({
        ...initialState
    });

    // Handle input change for doubt form fields
    const handleInputChange = (value, fieldName) => {
        setFormData({
            ...formData,
            [fieldName]: value,
        });
    };

    // Validate doubt form fields
    const validate = () => {
        let isValid = true;
        const error = { ...initialState.error };

        if (formData.task_id.trim() === "") {
            isValid = false;
            error.task_id = "Task ID is required";
        }



        if (formData.doubt_message.trim() === "") {
            isValid = false;
            error.doubt_message = "Doubt message is required";
        }
        if (formData.resolved_by.trim() === "") {
            isValid = false;
            error.resolved_by = "Asked to is required";
        }

        setFormData({ ...formData, error });
        return isValid;
    };
    const debounce = UseDebounce();

    //handle pagination
    const handlePagination = (value) => {
        setPage(value);
        let offset = (value - 1) * limit;
        fetchDoubts(offset, limit, searchValue)
    }
    //change limit
    const handleChangeLimit = (value) => {
        setLimit(value);
        setPage(1);
        fetchDoubts(0, value, searchValue)
    }
    //handle search
    const handleSearch = (e) => {
        setSearchValue(e)
        debounce(() => searchTableFunction(e), 800)
    }
    //table function
    const searchTableFunction = (e) => {
        if (page > 1) {
            setPage(1);
        }
        fetchDoubts(0, limit, e)
    }
    // Handle add button click
    const handleAddClick = () => {
        setShowAddDialog(true);
    };

    // Handle form submission for adding/editing doubts
    const handleSubmit = () => {

        if (validate()) {

            const payload = {
                id: formData?.id ?? undefined,
                task_id: formData.task_id,
                user_id: userId?.id ?? undefined,
                doubt_message: formData.doubt_message,
                resolved: formData.resolved,
                resolved_by: formData.resolved_by,

            };

            // Sample Axios call to add/edit doubt
            NetworkCall(`${config.apiUrl}task_doubts/upsert`, NetWorkCallMethods.post, payload)
                .then((res) => {
                    setFormData({ ...initialState }); // Reset form data after successful submission
                    setShowAddDialog(false); // Close dialog after successful submission
                    toast.success('Doubt added/edited successfully!', { autoClose: 2000 });
                    fetchDoubts(); // Fetch doubts again to update the list
                    console.log('Doubt added/edited:', res.data);
                })
                .catch((error) => {
                    toast.error('Network error occurred!', { autoClose: 2000 });
                    console.error('Error adding/editing doubt:', error);
                });
        }
    };

    // Fetch doubts from API
    const fetchDoubts = (offset = 0, limit = 5, search) => {
        const payload = {
            offset: offset,
            search: search,
            limit: limit
        }
        NetworkCall(`${config.apiUrl}task_doubts`, NetWorkCallMethods.post, payload)
            .then((res) => {
                setDoubts(res?.data); // Assuming API response returns doubts data
            })
            .catch((error) => {
                console.error('Error fetching doubts:', error);
            });
    };

    // Handle actions on doubts (resolve, delete, etc.)
    const handleAction = (action, row) => {
        console.log(action, row);
        switch (action) {
            case 'view':
                setFormData({
                    task_id: row?.task_id,
                    doubt_message: row?.doubt_message,
                    resolved_by: row?.resolved_by,
                    resolved: row?.resolved,
                    isView: true,
                    isEdit: false,
                });
                setShowAddDialog(true); // Show dialog with view mode
                break;
            case 'edit':
                setFormData({
                    task_id: row?.task_id,
                    doubt_message: row?.doubt_message,
                    resolved_by: row?.resolved_by,
                    raised_date: row?.raised_date,
                    resolved: row?.resolved,
                    id: row?.id,
                    isEdit: true,
                    isView: false,
                });
                setShowAddDialog(true); // Show dialog with view mode

                break;

            case 'delete':
                // Handle delete action
                break;
            default:
                break;
        }
    };

    // Fetch initial data from API on component mount
    useEffect(() => {
        fetchDataTask();
        fetchDoubts();
    }, []);


    useEffect(() => {
        if (formData?.task_id?.length > 0) {
            fetchDataProjects()
        }
    }, [formData?.task_id]);

    // Fetch data function
    const fetchDataProjects = (offset = 0, limit = 5000, search) => {
        const payload = {
            search: "",
            offset: offset,
            limit: limit,
            is_active: true,
            project_id: taskList.filter(i => i.id === formData?.task_id)?.[0]?.project_id
        };

        NetworkCall(`${config.apiUrl}projects`, NetWorkCallMethods.post, payload)
            .then((res) => {
                let data = res?.data ?? []

                setProjects(transformObjectsArray(data));
                fetchDataEmployee(data?.[0])

            })
            .catch((error) => {
                console.error('Error listing projects:', error);
            });
    };
    const fetchDataEmployee = (id) => {
        const tm = id?.team_members ?? []
        if (tm?.length > 0) {
            const payload = {
                offset: 0,
                limit: 1000,
                role: ["Developer", "Designer", "Manager"],
                user_profile_id: tm?.length > 0 ? tm : []
            };

            NetworkCall(`${config.apiUrl}users_profiles`, NetWorkCallMethods.post, payload)
                .then((res) => {
                    let data = res?.data ? res?.data?.filter((i) => i?.id !== userId?.id) : []
                    setEmployeeOptions(transformObjectsArray(data));
                })
                .catch((error) => {
                    console.error('Error listing projects:', error);
                });
        }
    };
    const fetchDataTask = () => {
        const payload = {
            search: "",
            offset: 0,
            limit: 1000,
            // user_profile_id: userId?.id,
            is_active: true
        }
        NetworkCall(`${config.apiUrl}tasks`, NetWorkCallMethods.post, payload
        ).then((res) => {
            setTaskList(transformObjectsArray(res?.data))
        }).catch((error) => {
            console.error('Error lisiting tasks:', error);
        })

    };
    // Define form fields for doubt form
    const fields = [
        {
            type: 'select',
            label: 'Task ID',
            value: formData?.task_id,
            onChange: (value) => handleInputChange(value, 'task_id'),
            required: true,
            error: formData?.error?.task_id,
            options: taskList ?? [] // Populate with tasks options fetched from API or state
        },

        {
            type: 'text',
            label: 'Doubt Message',
            value: formData?.doubt_message,
            onChange: (value) => handleInputChange(value, 'doubt_message'),
            required: true,
            error: formData?.error?.doubt_message,
        },
        {
            type: 'select',
            label: 'Asked To',
            value: formData?.resolved_by,
            onChange: (value) => handleInputChange(value, 'resolved_by'),
            required: true,
            error: formData?.error?.resolved_by,
            disabled: formData?.isView ? true : false,
            options: employeeOptions,
            multi: false,
            error: formData?.error?.resolved_by,


        },
        {
            type: 'checkbox',
            label: 'Resolved',
            value: formData?.resolved,
            onChange: (value) => handleInputChange(value, 'resolved'),
            disabled: formData?.isView ? true : false
        },
        // Additional fields like resolved, resolved_by, raised_date, resolved_date can be added as needed
    ];

    // Define columns for doubts table
    const columns = [
        { label: 'Task Name', key: 'task_name' },
        { label: 'Asked By', key: 'asked_by' },
        { label: 'Doubt Message', key: 'doubt_message' },
        { label: 'Resolved', key: 'resolved', type: "yes" },
        { label: 'Asked To', key: 'asked_to' },
        { label: 'Raised Date', key: 'raised_date', type: "date" },
        { label: 'Resolved Date', key: 'resolved_date', type: "date" },
    ];

    return (
        <Container>
            <Row className='justify-content-between'>
                <Col md={6}>
                    <h2>Tasks Doubts</h2>
                    {/* Search box */}
                    <TextBox
                        label="Search"
                        placeholder="Enter search text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {/* Table component */}
                </Col>
                <Col md={6} className="text-end">

                    <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add Task</Button>
                </Col>

            </Row>
            <Row>
                <Col xs={12}>
                    <TableComponent columns={columns} data={doubts}

                        onAction={handleAction}
                        page={page}
                        handlePagination={handlePagination}
                        handleChangeLimit={handleChangeLimit}
                        totalCount={doubts?.[0]?.totalCount ?? 0}
                    />

                </Col>
            </Row>
            {/* Add dialog */}
            <SelectDialog show={showAddDialog} onClose={() => setShowAddDialog(false)} Body={

                <FormGenerator
                    fields={fields}
                    onSubmit={handleSubmit}
                    className="my-form-container"
                    hideBtn={formData?.isView}
                />
            } />
            {/* Filter select dialog
            <SelectDialog show={showFilterDialog} onClose={() => setShowFilterDialog(false)}
                Body={

                    <FormGenerator
                        fields={filterFields}
                        onSubmit={handleSubmit}
                        className="my-form-container"
                        hideBtn={formData?.isView}
                    />
                }
            /> */}
        </Container>
    );
};

export default CombinedNavBar(TaskDoubtScreen);
