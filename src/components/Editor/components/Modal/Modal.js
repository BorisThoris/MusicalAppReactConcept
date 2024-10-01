import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 600px;
    background-color: #f9f9f9;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 30px;
    border: 1px solid #ddd;
    position: relative;
    z-index: 1001;
`;

const CloseIcon = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
`;

const Modal = ({ children, onClose }) => {
    const handleBackdropClick = useCallback(
        (e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <Backdrop onClick={handleBackdropClick}>
            <ModalWrapper>
                <CloseIcon onClick={onClose}>X</CloseIcon>
                {children}
            </ModalWrapper>
        </Backdrop>
    );
};

Modal.propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired
};

export default Modal;
