import React, { useContext } from 'react';
import styled from 'styled-components';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import PasteButton from './PasteButton';

const MenuContainer = styled.div`
    background: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border: 2px solid ${({ theme }) => theme.colors.semantic.border.primary};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    padding: ${({ theme }) => theme.spacing[1]};
    position: absolute;
    width: 150px;
    z-index: ${({ theme }) => theme.zIndex.dropdown};
    left: ${({ position }) => `${position.x}px`};
    top: ${({ position }) => `${position.y}px`};
    border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const MenuList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const MenuItem = styled.div`
    background: ${({ theme }) => theme.colors.semantic.surface.primary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[1]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};
    color: ${({ theme }) => theme.colors.semantic.text.primary};

    &:hover {
        background: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }

    &:focus {
        outline: none;
        background: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }
`;

const ActionsMenu = ({ actionsMenuState }) => {
    const { copiedEvents } = useContext(CollisionsContext);
    const { element: recording, position: menuPosition } = actionsMenuState;

    return (
        <MenuContainer position={menuPosition}>
            <MenuList>
                {copiedEvents.length > 0 && <PasteButton menuPosition={menuPosition} copiedEvents={copiedEvents} />}
                {recording && (
                    <>
                        <MenuItem role="button">Delete</MenuItem>
                        <MenuItem role="button">Copy</MenuItem>
                        <MenuItem role="button">Cut</MenuItem>
                    </>
                )}
            </MenuList>
        </MenuContainer>
    );
};

export default ActionsMenu;
