import React from 'react';
import { Modal } from 'react-bootstrap';

const SelectDialog = ({ show, onClose, Body, Footer, title }) => {
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {Body}
            </Modal.Body>
            <Modal.Footer>
                {Footer}
            </Modal.Footer>
        </Modal>
    );
};

export default SelectDialog;
