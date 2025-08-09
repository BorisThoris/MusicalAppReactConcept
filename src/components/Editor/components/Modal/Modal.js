import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.semantic.background.overlay};
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ModalWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 600px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    box-shadow: ${({ theme }) => theme.shadows['2xl']};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[8]};
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    position: relative;
    z-index: ${({ theme }) => theme.zIndex.modal + 1};
`;

const CloseIcon = styled.div`
    position: absolute;
    top: ${({ theme }) => theme.spacing[2]};
    right: ${({ theme }) => theme.spacing[2]};
    cursor: pointer;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.text.secondary};

    &:hover {
        color: ${({ theme }) => theme.colors.semantic.text.primary};
    }
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
