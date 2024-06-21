import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import Button from '../button';

const FormGenerator = ({
    fields,  // Array of field objects containing configuration for each form element
    onSubmit,
    className,
    hideBtn = false
}) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit();  // Call onSubmit function passed as prop
    };

    return (
        <Container className={className}>
            <Row>
                {fields?.map((field, index) => (
                    <Col key={index} xs={field?.gridSize || 12} className={field?.colClassName}>
                        {/* Render different types of form elements based on field?.type */}
                        {field?.type === 'text' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={field?.value}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Enter ${field?.label}`}
                                    disabled={field?.disabled}
                                    readOnly={field?.readOnly}
                                    required={field?.required}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}
                        {field?.type === 'phone' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={field?.value}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Enter ${field?.label}`}
                                    disabled={field?.disabled}
                                    readOnly={field?.readOnly}
                                    required={field?.required}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {field?.type === 'email' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={field?.value}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Enter ${field?.label}`}
                                    disabled={field?.disabled}
                                    readOnly={field?.readOnly}
                                    required={field?.required}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}
                        {field?.type === 'password' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={field?.value}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Enter ${field?.label}`}
                                    disabled={field?.disabled}
                                    readOnly={field?.readOnly}
                                    required={field?.required}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {field?.type === 'select' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={field?.value || ''}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Select ${field?.label}`}
                                    disabled={field?.disabled}
                                    required={field?.required}
                                >
                                    <option value="">{`Select ${field?.label}`}</option>
                                    {field?.options.map((option, idx) => (
                                        <option key={idx} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Control>
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {field?.type === 'date' && (
                            <Form.Group>
                                <Form.Label>{field?.label}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={field?.value}
                                    onChange={(e) => field?.onChange(e.target.value)}
                                    placeholder={`Enter ${field?.label}`}
                                    disabled={field?.disabled}
                                    readOnly={field?.readOnly}
                                    required={field?.required}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {field?.type === 'checkbox' && (
                            <Form.Group>
                                <Form.Check
                                    type="checkbox"
                                    id={`checkbox-${field?.label}-${index}`}
                                    label={field?.label}
                                    checked={field?.value}
                                    onChange={(e) => field?.onChange(e.target.checked)}
                                    disabled={field?.disabled}
                                />
                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {field?.type === 'toggle' && (
                            <Form.Group>
                                <label>{field?.label}</label>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label={field?.label}
                                    defaultValue={field?.value}
                                    onChange={(checked) => field?.onChange(checked)}
                                    disabled={field?.disabled}
                                />

                                {field?.error && field?.error?.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {field?.error}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {/* Add more conditions for other types of form fields like buttons, radios, etc. */}

                    </Col>
                ))}
            </Row>

            {/* Submit Button */}
            {!hideBtn &&
                <Row>
                    <Col>
                        <Button type="submit" onClick={handleSubmit}>Submit</Button>
                    </Col>
                </Row>
            }
        </Container>
    );
};

export default FormGenerator;
