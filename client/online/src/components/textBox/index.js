// components/TextBox.js
import React from 'react';
import { Form } from 'react-bootstrap';
import './TextBox.css';

const TextBox = ({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    readOnly,
    required,
    type = 'text',
    id,
    name,
    className,
    style,
    passwordError
}) => (
    <Form.Group className={className} style={style}>
        <Form.Label className="text-box-label">{label}</Form.Label>
        <Form.Control
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            id={id}
            name={name}
            className="text-box-value"
        />
        {passwordError && <p className="error-message text-danger">{passwordError}</p>}
    </Form.Group>
);

export default TextBox;
