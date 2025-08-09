import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.glass.backdrop};
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
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
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: ${({ theme }) => theme.shadows.glassXl};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[8]};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
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
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
        transform: scale(1.1);
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
