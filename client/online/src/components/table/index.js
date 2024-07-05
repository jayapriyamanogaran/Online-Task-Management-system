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


const TableComponent = ({ columns, data, onAction, page, handlePagination, totalCount = 0 }) => {
    const itemsPerPage = 5; // Number of items per page
    const currentPage = page; // Current page number
    // Current page number
    const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total pages

    // Calculate start and end indexes for pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalCount - 1);

    // Filter data based on current page
    const currentData = data;
    console.log(startIndex);
    console.log(currentPage, "cur");
    console.log(endIndex);
    console.log(totalCount);
    console.log(currentData);

    // Handle page change


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
                                <td key={colIndex}>
                                    {column.type === 'date' && row[column.key]?.length > 0 && new Date(row[column.key]).toLocaleDateString()}
                                    {column.type === 'status' && (row[column.key] ? 'Active' : 'Inactive')}
                                    {column.type === 'yes' && (row[column.key] ? 'Yes' : 'No')}
                                    {column.type !== 'date' && column.key !== 'status' && row[column.key]}

                                </td>
                            ))}

                            <td>

                                <DropdownButton
                                    id={`dropdown-${rowIndex}`}
                                    // title={<i className="fas fa-ellipsis-v"></i>}
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
                onPageChange={handlePagination}
            />
        </div>
    );
};

export default TableComponent;
