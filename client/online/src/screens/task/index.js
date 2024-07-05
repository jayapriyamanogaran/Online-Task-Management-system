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
import { UseDebounce, toShow, transformObjectsArray } from '../../utils/constants';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faL } from '@fortawesome/free-solid-svg-icons';

const TaskScreen = () => {
    const initialState = {
        id: "",
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        taskPriority: "",
        isActive: true,
        projectId: "", // Assuming you'll manage project selection
        assignedId: "", // Assuming you'll manage user assignment
        isEdit: false,
        isView: false,
        taskStatus: false,
        error: {
            name: "",
            description: "",
            startDate: "",
            endDate: "",
            taskPriority: "",
        }
    };

    const [data, setData] = useState({ ...initialState });
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [ll, setLL] = useState([]); // Assuming this will hold fetched data
    const [projects, setProjects] = useState([]); // Assuming this will hold fetched project data
    const [employeeOptions, setEmployeeOptions] = useState([]);
    // Form data state
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        taskPriority: "",
        isActive: true,
        projectId: "", // Assuming you'll manage project selection
        assignedId: "",
        taskStatus: ""
    });

    // Handle input change for form fields
    const handleInputChange = (value, fieldName) => {
        setFormData({
            ...formData,
            [fieldName]: value,
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        fetchData()
        setFormData({
            startDate: "",
            endDate: "",
            taskPriority: "",
            isActive: true,
            projectId: "", // Assuming you'll manage project selection
            assignedId: "",
        })
        setShowFilterDialog(false)        // Handle form submission here (e.g., send data to backend)
        console.log(formData);
    };

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
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(5);
    const [searchValue, setSearchValue] = React.useState('');

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

        if (data?.startDate?.trim() === "") {
            isValid = false;
            error.startDate = "Start Date is required";
        }

        if (data?.endDate?.trim() === "") {
            isValid = false;
            error.endDate = "End Date is required";
        }

        // Validate taskPriority if it's a required field
        // Assuming taskPriority is a dropdown or select field, ensure it's validated appropriately

        if (data?.projectId?.trim() === "") {
            isValid = false;
            error.projectId = "Project ID is required";
        }

        if (data?.assignedId?.trim() === "") {
            isValid = false;
            error.assignedId = "Assigned ID is required";
        }

        setData({ ...data, error });
        return isValid;
    };

    //debounce hook
    const debounce = UseDebounce();
    //handle pagination
    const handlePagination = (value) => {
        setPage(value);
        let offset = (value - 1) * limit;
        fetchData(offset, limit, searchValue)
    }
    //change limit
    const handleChangeLimit = (value) => {
        setLimit(value);
        setPage(1);
        fetchData(0, value, searchValue)
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
        fetchData(0, limit, e)
    }
    // Handle add button click
    const handleAddClick = () => {
        setShowAddDialog(true);
    };

    // Handle filter button click
    const handleFilterClick = () => {
        setShowFilterDialog(true);
    };

    // Handle actions on table rows (view, edit, delete)
    const handleAction = (action, row) => {
        console.log(action, row);
        switch (action) {
            case 'view':
                setData({
                    name: row?.name,
                    description: row?.description,
                    startDate: row?.start_date,
                    endDate: row?.end_date,
                    taskPriority: row?.task_priority,
                    isActive: row?.is_active,
                    projectId: row?.project_id,
                    assignedId: row?.assigned_id,
                    task_status: row?.taskStatus,
                    isView: true,
                    isEdit: false,
                });
                setShowAddDialog(true); // Show dialog with view mode
                break;
            case 'edit':
                setData({
                    name: row?.name,
                    description: row?.description,
                    startDate: row?.start_date,
                    endDate: row?.end_date,
                    taskPriority: row?.task_priority,
                    isActive: row?.is_active,
                    projectId: row?.project_id,
                    assignedId: row?.assigned_id,
                    task_status: row?.taskStatus,
                    id: row?.id,
                    isEdit: true,
                    isView: false,
                });
                setShowAddDialog(true); // Show dialog with view mode

                break;

            case 'delete':
                deleteTask(row)
                // Handle delete action
                break;
            default:
                break;
        }
    };

    // Fetch initial data from API on component mount
    useEffect(() => {
        fetchData();
        fetchDataProjects()
    }, []);
    useEffect(() => {
        if (data?.projectId?.length > 0) {
            fetchDataEmployee()
        }
    }, [data?.projectId]);

    console.log(data, "///");
    // Fetch data function
    const fetchDataProjects = (offset = 0, limit = 5, search) => {
        const payload = {
            search: search,
            offset: offset,
            limit: limit,
            is_active: true
        };

        NetworkCall(`${config.apiUrl}projects`, NetWorkCallMethods.post, payload)
            .then((res) => {
                let data = res?.data ?? []

                setProjects(transformObjectsArray(data));
            })
            .catch((error) => {
                console.error('Error listing projects:', error);
            });
    };
    const fetchDataEmployee = (offset = 0, limit = 100) => {
        const tm = [].concat(...projects?.filter((i) => i?.id === data?.projectId)?.map((i) => i.team_members))
        if (tm?.length > 0) {
            const payload = {
                offset: offset,
                limit: limit,
                role: ["Developer", "Designer", "Manager"],
                user_profile_id: tm?.length > 0 ? tm : []
            };

            NetworkCall(`${config.apiUrl}users_profiles`, NetWorkCallMethods.post, payload)
                .then((res) => {
                    let data = res?.data ?? []
                    setEmployeeOptions(transformObjectsArray(data));
                })
                .catch((error) => {
                    console.error('Error listing projects:', error);
                });
        }
    };
    // Fetch data function
    const fetchData = (offset = 0, limit = 5, search) => {
        const payload = {
            search: search,
            offset: offset,
            limit: limit,
            start_date: formData?.startDate ?? undefined,
            end_date: formData?.endDate ?? undefined,
            project_id: formData?.projectId ?? undefined,
            assigned_id: formData?.assignedId ?? undefined,
            is_active: formData?.isActive ?? undefined,
            task_status: formData?.taskStatus ?? undefined
        }
        NetworkCall(`${config.apiUrl}tasks`, NetWorkCallMethods.post, payload
        ).then((res) => {
            setLL(res?.data)
        }).catch((error) => {
            console.error('Error lisiting tasks:', error);
        })

    };
    const deleteTask = (data) => {
        const payload = {
            id: data?.id ?? undefined,
            name: data?.name,
            description: data?.description,
            start_date: data?.startDate,
            end_date: data?.endDate,
            task_priority: data?.taskPriority,
            is_active: false,
            project_id: data?.projectId,
            assigned_id: data?.assignedId ?? undefined,
            task_status: data?.taskStatus ?? undefined,
        }
        // Sample Axios call to add new employee
        NetworkCall(`${config.apiUrl}tasks/upsert`, NetWorkCallMethods.post, payload
        ).then((res) => {
            setData({ ...initialState }); // Reset form data after successful submission
            setShowAddDialog(false); // Close dialog after successful submission
            toast.success('Task Deleted succeessfully!', { autoClose: 2000 });
            fetchData()
            console.log('Task added:', res.data);
        }).catch((error) => {
            toast.error('Network error occurred!', { autoClose: 2000 });

            console.error('Error adding employee:', error);
        })





    };

    // Handle form submission for adding new employee
    const handleAdd = () => {
        if (validate()) {
            const payload = {
                id: data?.id ?? undefined,
                name: data?.name,
                description: data?.description,
                start_date: data?.startDate,
                end_date: data?.endDate,
                task_priority: data?.taskPriority,
                is_active: data?.isActive,
                project_id: data?.projectId,
                assigned_id: data?.assignedId ?? undefined,
                task_status: data?.taskStatus ?? undefined,
            }
            // Sample Axios call to add new employee
            NetworkCall(`${config.apiUrl}tasks/upsert`, NetWorkCallMethods.post, payload
            ).then((res) => {
                setData({ ...initialState }); // Reset form data after successful submission
                setShowAddDialog(false); // Close dialog after successful submission
                toast.success('Task added succeessfully!', { autoClose: 2000 });
                fetchData()
                console.log('Task added:', res.data);
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
        {
            type: 'date',
            label: 'Start Date',
            value: data?.startDate,
            onChange: (value) => updateState(value, 'startDate'),
            required: true,
            error: data?.error?.startDate,
            disabled: data?.isView ? true : false
        },
        {
            type: 'date',
            label: 'End Date',
            value: data?.endDate,
            onChange: (value) => updateState(value, 'endDate'),
            required: true,
            error: data?.error?.endDate,
            disabled: data?.isView ? true : false
        },
        {
            type: 'select',
            label: 'Task Priority',
            value: data?.taskPriority,
            onChange: (value) => updateState(value, 'taskPriority'),
            options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
            ],
            disabled: data?.isView ? true : false
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: data?.isActive,
            onChange: (value) => updateState(value, 'isActive'),
            disabled: data?.isView ? true : false
        },
        {
            type: 'select',
            label: 'Project',
            value: data?.projectId,
            onChange: (value) => updateState(value, 'projectId'),
            required: true,
            error: data?.error?.projectId,
            disabled: data?.isView ? true : false,
            options: projects,
            multi: false

        },
        {
            type: 'select',
            label: 'Assigned To',
            value: data?.assignedId,
            onChange: (value) => updateState(value, 'assignedId'),
            required: true,
            error: data?.error?.assignedId,
            disabled: data?.isView ? true : false,
            options: employeeOptions,
            multi: false

        },
        {
            type: 'checkbox',
            label: 'Task Completed',
            value: data?.taskStatus,
            onChange: (value) => updateState(value, 'taskStatus'),
            disabled: data?.isView ? true : false
        },
        // Add projectId and assignedId fields if needed (e.g., select or autocomplete)
    ];
    const filterFields = [

        {
            type: 'date',
            label: 'Start Date',
            value: formData?.startDate,
            onChange: (value) => handleInputChange(value, 'startDate'),
            required: true,
            error: formData?.error?.startDate,
            disabled: formData?.isView ? true : false
        },
        {
            type: 'date',
            label: 'End Date',
            value: formData?.endDate,
            onChange: (value) => handleInputChange(value, 'endDate'),
            required: true,
            error: formData?.error?.endDate,
            disabled: formData?.isView ? true : false
        },
        {
            type: 'select',
            label: 'Task Priority',
            value: formData?.taskPriority,
            onChange: (value) => handleInputChange(value, 'taskPriority'),
            options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
            ],
            disabled: formData?.isView ? true : false
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: formData?.isActive,
            onChange: (value) => handleInputChange(value, 'isActive'),
            disabled: formData?.isView ? true : false
        },
        {
            type: 'checkbox',
            label: 'Task Completed',
            value: formData?.taskStatus,
            onChange: (value) => handleInputChange(value, 'taskStatus'),
            disabled: formData?.isView ? true : false
        },
        // Add projectId and assignedId fields if needed (e.g., select or autocomplete)
    ];

    const columns = [
        { label: 'Name', key: 'name' },
        { label: 'Description', key: 'description' },
        { label: 'Start Date', key: 'start_date', type: "date" },
        { label: 'End Date', key: 'end_date', type: "date" },
        // { label: 'Created At', key: 'created_at' },
        // { label: 'Updated At', key: 'updated_at' },
        { label: 'Task Priority', key: 'task_priority' },
        { label: 'Is Active', key: 'isActive', },
        { label: 'Project ', key: 'project_name' },
        { label: 'Assigned To', key: 'user_profile_name' },
        { label: 'Task Completed', key: 'task_status', type: "yes" },
    ];

    return (
        <Container>
            <Row className='justify-content-between'>
                <Col md={6}>
                    <h2>Tasks</h2>
                    {/* Search box */}
                    <TextBox
                        label="Search"
                        placeholder="Enter search text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {/* Table component */}
                </Col>
                {toShow() &&
                    <Col md={6} className="text-end">
                        {/* Filter icon */}
                        <i className="fa fa-filter" onClick={handleFilterClick}></i>
                        {/* Add button */}
                        <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add Task</Button>
                    </Col>
                }
            </Row>
            <Row>
                <Col xs={12}>
                    <TableComponent columns={columns} data={ll}

                        onAction={handleAction}
                        page={page}
                        handlePagination={handlePagination}
                        handleChangeLimit={handleChangeLimit}
                        totalCount={ll?.[0]?.totalCount ?? 0}
                    />

                </Col>
            </Row>
            {/* Add dialog */}
            <SelectDialog show={showAddDialog} onClose={() => setShowAddDialog(false)} Body={

                <FormGenerator
                    fields={fields}
                    onSubmit={handleAdd}
                    className="my-form-container"
                    hideBtn={data?.isView}
                />
            } />
            {/* Filter select dialog */}
            <SelectDialog show={showFilterDialog} onClose={() => setShowFilterDialog(false)}
                Body={

                    <FormGenerator
                        fields={filterFields}
                        onSubmit={handleSubmit}
                        className="my-form-container"
                        hideBtn={formData?.isView}
                    />
                }
            />
        </Container>
    );
};

export default CombinedNavBar(TaskScreen);
