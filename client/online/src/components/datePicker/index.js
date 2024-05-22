// components/DatePicker.js
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Form } from 'react-bootstrap';
import './datePicker.css';

const DatePicker = ({
    label,
    selected,
    onChange,
    dateFormat,
    placeholderText,
    disabled,
    readOnly,
    required,
    id,
    name,
    className,
    style,
}) => (
    <Form.Group className={className} style={style}>
        <Form.Label className="date-picker-label">{label}</Form.Label>
        <ReactDatePicker
            selected={selected}
            onChange={onChange}
            dateFormat={dateFormat}
            placeholderText={placeholderText}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            id={id}
            name={name}
            className="date-picker-value"
        />
    </Form.Group>
);

export default DatePicker;
