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
import { UseDebounce } from '../../utils/constants';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'

const ProjectScreen = () => {
    const initialState = {
        id: "",
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        is_active: false,
        project_status: "",
        team_members: [], // Array of UUIDs referencing userprofiles
        isEdit: false,
        isView: false,
        error: {
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            project_status: "",
        }
    };

    const [data, setData] = useState({ ...initialState });
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [projects, setProjects] = useState([]); // Assuming this will hold fetched project data

    // Form data state
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        is_active: true,
        project_status: "",
        team_members: [],
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
        fetchData();
        setFormData({
            start_date: "",
            end_date: "",
            is_active: false,
            project_status: "",
            team_members: [],
        });
        setShowFilterDialog(false);
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

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [searchValue, setSearchValue] = useState('');

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

        if (data?.start_date?.trim() === "") {
            isValid = false;
            error.start_date = "Start Date is required";
        }

        if (data?.end_date?.trim() === "") {
            isValid = false;
            error.end_date = "End Date is required";
        }

        setData({ ...data, error });
        return isValid;
    };

    // Debounce hook
    const debounce = UseDebounce();

    // Handle pagination
    const handlePagination = (value) => {
        setPage(value);
        let offset = (value - 1) * limit;
        fetchData(offset, limit, searchValue);
    };

    // Change limit
    const handleChangeLimit = (value) => {
        setLimit(value);
        setPage(1);
        fetchData(0, value, searchValue);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchValue(e);
        debounce(() => searchTableFunction(e), 800);
    };

    // Table function
    const searchTableFunction = (e) => {
        if (page > 1) {
            setPage(1);
        }
        fetchData(0, limit, e);
    };

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
                    start_date: moment(row?.start_date).format('YYYY-MM-DD'),
                    end_date: moment(row?.end_date).format('YYYY-MM-DD'),
                    is_active: row?.is_active,
                    project_status: row?.project_status,
                    team_members: row?.team_members,

                    isView: true,
                    isEdit: false,
                });
                setShowAddDialog(true); // Show dialog with view mode
                break;
            case 'edit':
                setData({
                    name: row?.name,
                    description: row?.description,
                    start_date: moment(row?.start_date).format('YYYY-MM-DD'),
                    end_date: moment(row?.end_date).format('YYYY-MM-DD'),
                    is_active: row?.is_active,
                    project_status: row?.project_status,
                    team_members: row?.team_members,
                    id: row?.id,
                    isEdit: true,
                    isView: false,
                });
                setShowAddDialog(true); // Show dialog with edit mode
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
        fetchData();
    }, []);

    console.log(formData);

    // Fetch data function
    const fetchData = (offset = 0, limit = 5, search) => {
        const payload = {
            search: search,
            offset: offset,
            limit: limit,
            start_date: formData?.start_date ?? undefined,
            end_date: formData?.end_date ?? undefined,
            project_status: formData?.project_status ?? undefined,
            is_active: formData?.is_active ?? undefined,
            team_members: formData?.team_members ?? [],
        };

        NetworkCall(`${config.apiUrl}projects`, NetWorkCallMethods.post, payload)
            .then((res) => {
                setProjects(res?.data);
            })
            .catch((error) => {
                console.error('Error listing projects:', error);
            });
    };

    // Handle form submission for adding or editing a project
    const handleAdd = () => {
        if (validate()) {
            const payload = {
                id: data?.id ?? undefined,
                name: data?.name,
                description: data?.description,
                start_date: data?.start_date,
                end_date: data?.end_date,
                is_active: data?.is_active,
                project_status: data?.project_status,
                team_members: data?.team_members,
            };

            NetworkCall(`${config.apiUrl}projects/upsert`, NetWorkCallMethods.post, payload)
                .then((res) => {
                    setData({ ...initialState }); // Reset form data after successful submission
                    setShowAddDialog(false); // Close dialog after successful submission
                    toast.success('Project added successfully!', { autoClose: 2000 });
                    fetchData();
                    console.log('Project added:', res.data);
                })
                .catch((error) => {
                    toast.error('Network error occurred!', { autoClose: 2000 });
                    console.error('Error adding project:', error);
                });
        }
    };
    console.log(data);
    // Define form fields for FormGenerator component
    const fields = [
        {
            type: 'text',
            label: 'Name',
            value: data?.name,
            onChange: (value) => updateState(value, 'name'),
            required: true,
            error: data?.error?.name,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'text',
            label: 'Description',
            value: data?.description,
            onChange: (value) => updateState(value, 'description'),
            required: true,
            error: data?.error?.description,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'date',
            label: 'Start Date',
            value: data?.start_date,
            onChange: (value) => updateState(value, 'start_date'),
            required: true,
            error: data?.error?.start_date,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'date',
            label: 'End Date',
            value: data?.end_date,
            onChange: (value) => updateState(value, 'end_date'),
            required: true,
            error: data?.error?.end_date,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'select',
            label: 'Project Status',
            value: data?.project_status,
            onChange: (value) => updateState(value, 'project_status'),
            required: true,
            error: data?.error?.project_status,
            disabled: data?.isView ? true : false,
            options: [
                { value: 'Yet to start', label: 'Yet to start' },
                { value: 'In progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
            ],
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: data?.is_active,
            onChange: (value) => updateState(value, 'is_active'),
            disabled: data?.isView ? true : false,
        },
        // Add team_members field if needed (e.g., multi-select or autocomplete)
    ];

    const filterFields = [
        {
            type: 'date',
            label: 'Start Date',
            value: formData?.start_date,
            onChange: (value) => handleInputChange(value, 'start_date'),
            required: true,
            error: formData?.error?.start_date,
            disabled: formData?.isView ? true : false,
        },
        {
            type: 'date',
            label: 'End Date',
            value: formData?.end_date,
            onChange: (value) => handleInputChange(value, 'end_date'),
            required: true,
            error: formData?.error?.end_date,
            disabled: formData?.isView ? true : false,
        },
        {
            type: 'select',
            label: 'Project Status',
            value: formData?.project_status,
            onChange: (value) => handleInputChange(value, 'project_status'),
            required: true,
            error: formData?.error?.project_status,
            disabled: formData?.isView ? true : false,
            options: [
                { value: 'Yet to start', label: 'Yet to start' },
                { value: 'In progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
            ],
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: formData?.is_active,
            onChange: (value) => handleInputChange(value, 'is_active'),
            disabled: formData?.isView ? true : false,
        },
        // Add team_members field if needed (e.g., multi-select or autocomplete)
    ];

    const columns = [
        { label: 'Name', key: 'name' },
        { label: 'Description', key: 'description' },
        { label: 'Start Date', key: 'start_date', type: "date" },
        { label: 'End Date', key: 'end_date', type: "date" },
        { label: 'Project Status', key: 'project_status' },
        { label: 'Is Active', key: 'isActive' },
        // { label: 'Created At', key: 'created_at' },
        // { label: 'Updated At', key: 'updated_at' },
        // { label: 'Team Members', key: 'team_members' },
    ];

    return (
        <Container>
            <Row className='justify-content-between'>
                <Col md={6}>
                    <h2>Projects</h2>
                    {/* Search box */}
                    <TextBox
                        label="Search"
                        placeholder="Enter search text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </Col>
                <Col md={6} className="text-end">
                    {/* Filter icon */}
                    <i className="fa fa-filter" onClick={handleFilterClick}></i>
                    {/* Add button */}
                    <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add Project</Button>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TableComponent
                        columns={columns}
                        data={projects}
                        onAction={handleAction}
                        page={page}
                        handlePagination={handlePagination}
                        handleChangeLimit={handleChangeLimit}
                        totalCount={projects?.[0]?.totalCount ?? 0}
                    />
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
            {/* Filter select dialog */}
            <SelectDialog
                show={showFilterDialog}
                onClose={() => setShowFilterDialog(false)}
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

export default CombinedNavBar(ProjectScreen);
