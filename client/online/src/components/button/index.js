// components/Button.js
import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import './button.css';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size,
    block,
    active,
    disabled,
    type = 'button',
    className,
    style,
}) => (
    <BootstrapButton
        onClick={onClick}
        variant={variant}
        size={size}
        block={block}
        active={active}
        disabled={disabled}
        type={type}
        className={`custom-button ${className}`}
        style={style}

    >
        {children}
    </BootstrapButton>
);

export default Button;
