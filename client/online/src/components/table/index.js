import React, { useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './table.css'; // Import the CSS file
import { Pagination } from 'react-bootstrap';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const handleClick = (pageNumber) => {
        onPageChange(pageNumber);
    };

    const renderPaginationItems = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => handleClick(i)}>
                    {i}
                </Pagination.Item>
            );
        }
        return items;
    };

    return (
        <Pagination>
            <Pagination.Prev onClick={() => handleClick(currentPage - 1)} disabled={currentPage === 1} />
            {renderPaginationItems()}
            <Pagination.Next onClick={() => handleClick(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
    );
};


const TableComponent = ({ columns, data, onAction }) => {
    const itemsPerPage = 5; // Number of items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const totalPages = Math.ceil(data.length / itemsPerPage); // Calculate total pages

    // Calculate start and end indexes for pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, data.length - 1);

    // Filter data based on current page
    const currentData = data.slice(startIndex, endIndex + 1);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        {columns?.map((column, index) => (
                            <th key={index}>{column.label}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns?.map((column, colIndex) => (
                                <td key={colIndex}>{row[column.key]}</td>
                            ))}
                            <td>
                                <DropdownButton
                                    id={`dropdown-${rowIndex}`}
                                    title={<i className="fas fa-ellipsis-v"></i>}
                                    variant="secondary"
                                >
                                    <Dropdown.Item onClick={() => onAction('view', row)}>View</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction('edit', row)}>Edit</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onAction('delete', row)}>Delete</Dropdown.Item>
                                </DropdownButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default TableComponent;
