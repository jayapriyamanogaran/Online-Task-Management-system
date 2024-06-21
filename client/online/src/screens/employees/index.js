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
import moment from 'moment';

const EmployeeScreen = () => {
    const initialState = {
        id: "",
        name: "",
        phone_no: "",
        password: "",
        email_id: "",
        created_at: "",
        updated_at: "",
        role: "",
        is_active: false,
        isEdit: false,
        isView: false,
        error: {
            name: "",
            password: "",
            email_id: "",
            phone_no: "",
        }
    };

    const [data, setData] = useState({ ...initialState });
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [employees, setEmployees] = useState([]);

    // Form data state
    const [formData, setFormData] = useState({
        name: "",
        phone_no: "",
        password: "",
        email_id: "",
        role: "",
        is_active: true,
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
            name: "",
            phone_no: "",
            password: "",
            email_id: "",
            role: "",
            is_active: false,
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

        if (data?.password?.trim() === "") {
            isValid = false;
            error.password = "Password is required";
        }

        if (data?.email_id?.trim() === "") {
            isValid = false;
            error.email_id = "Email ID is required";
        }
        if (data?.phone_no?.trim() === "") {
            isValid = false;
            error.phone_no = "Phone number is required";
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
                    phone_no: row?.phone_no,
                    password: row?.password,
                    email_id: row?.email_id,
                    created_at: row?.created_at,
                    updated_at: row?.updated_at,
                    role: row?.role,
                    is_active: row?.is_active,

                    isView: true,
                    isEdit: false,
                });
                setShowAddDialog(true); // Show dialog with view mode
                break;
            case 'edit':
                setData({
                    name: row?.name,
                    phone_no: row?.phone_no,
                    password: row?.password,
                    email_id: row?.email_id,
                    created_at: row?.created_at,
                    updated_at: row?.updated_at,
                    role: row?.role,
                    is_active: row?.is_active,
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
        };

        NetworkCall(`${config.apiUrl}users_profiles`, NetWorkCallMethods.post, payload)
            .then((res) => {
                setEmployees(res?.data);
            })
            .catch((error) => {
                console.error('Error listing users_profiles:', error);
            });
    };

    // Handle form submission for adding or editing an employee
    const handleAdd = () => {
        if (validate()) {
            const payload = {
                id: data?.id ?? undefined,
                name: data?.name,
                phone_no: data?.phone_no,
                password: data?.password,
                email_id: data?.email_id,
                role: data?.role,
                is_active: data?.is_active,
            };

            NetworkCall(`${config.apiUrl}users_profiles/upsert`, NetWorkCallMethods.post, payload)
                .then((res) => {
                    setData({ ...initialState }); // Reset form data after successful submission
                    setShowAddDialog(false); // Close dialog after successful submission
                    toast.success('Employee added successfully!', { autoClose: 2000 });
                    fetchData();
                    console.log('Employee added:', res.data);
                })
                .catch((error) => {
                    toast.error('Network error occurred!', { autoClose: 2000 });
                    console.error('Error adding employee:', error);
                });
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
            disabled: data?.isView ? true : false,
        },
        {
            type: 'phone',
            label: 'Phone Number',
            value: data?.phone_no,
            onChange: (value) => updateState(value, 'phone_no'),
            error: data?.error?.phone_no,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'password',
            label: 'Password',
            value: data?.password,
            onChange: (value) => updateState(value, 'password'),
            required: true,
            error: data?.error?.password,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'email',
            label: 'Email ID',
            value: data?.email_id,
            onChange: (value) => updateState(value, 'email_id'),
            required: true,
            error: data?.error?.email_id,
            disabled: data?.isView ? true : false,
        },
        {
            type: 'select',
            label: 'Role',
            value: data?.role,
            onChange: (value) => updateState(value, 'role'),
            disabled: data?.isView ? true : false,
            options: [
                { value: 'HR', label: 'HR' },
                { value: 'Developer', label: 'Developer' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Designer', label: 'Designer' },
            ],
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: data?.is_active,
            onChange: (value) => updateState(value, 'is_active'),
            disabled: data?.isView ? true : false,
        },
    ];

    const filterFields = [
        {
            type: 'text',
            label: 'Name',
            value: formData?.name,
            onChange: (value) => handleInputChange(value, 'name'),
            required: true,
            error: formData?.error?.name,
            disabled: formData?.isView ? true : false,
        },
        {
            type: 'text',
            label: 'Email ID',
            value: formData?.email_id,
            onChange: (value) => handleInputChange(value, 'email_id'),
            required: true,
            error: formData?.error?.email_id,
            disabled: formData?.isView ? true : false,
        },
        {
            type: 'select',
            label: 'Role',
            value: formData?.role,
            onChange: (value) => handleInputChange(value, 'role'),
            required: true,
            error: formData?.error?.role,
            disabled: formData?.isView ? true : false,
            options: [
                { value: 'HR', label: 'HR' },
                { value: 'Developer', label: 'Developer' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Designer', label: 'Designer' },
            ],
        },
        {
            type: 'checkbox',
            label: 'Active',
            value: formData?.is_active,
            onChange: (value) => handleInputChange(value, 'is_active'),
            disabled: formData?.isView ? true : false,
        },
    ];

    const columns = [
        { label: 'Name', key: 'name' },
        { label: 'Phone Number', key: 'phone_no' },
        { label: 'Email ID', key: 'email_id' },
        { label: 'Role', key: 'role' },
        { label: 'Active', key: 'isActive' },
        { label: 'Created At', key: 'created_at', type: 'date' },
        { label: 'Updated At', key: 'updated_at', type: 'date' },
    ];

    return (
        <Container>
            <Row className='justify-content-between'>
                <Col md={6}>
                    <h2>Employees</h2>
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
                    <Button className={"mr-1"} variant="primary" onClick={handleAddClick}>Add Employee</Button>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TableComponent
                        columns={columns}
                        data={employees}
                        onAction={handleAction}
                        page={page}
                        handlePagination={handlePagination}
                        handleChangeLimit={handleChangeLimit}
                        totalCount={employees?.[0]?.totalCount ?? 0}
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

export default CombinedNavBar(EmployeeScreen);
