// components/SelectBox.js
import React from 'react';
import { Form } from 'react-bootstrap';
import './SelectBox.css';

const SelectBox = ({
    label,
    options,
    value,
    onChange,
    disabled,
    required,
    id,
    name,
    className,
    style,
}) => (
    <Form.Group className={className} style={style}>
        <Form.Label className="select-box-label">{label}</Form.Label>
        <Form.Control
            as="select"
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            id={id}
            name={name}
            className="select-box-value"
        >
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Form.Control>
    </Form.Group>
);

export default SelectBox;
