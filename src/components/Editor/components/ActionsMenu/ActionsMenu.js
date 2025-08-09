import React, { useContext } from 'react';
import styled from 'styled-components';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import PasteButton from './PasteButton';

const MenuContainer = styled.div`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
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
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[1]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    border: 1px solid transparent;

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }

    &:focus {
        outline: none;
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
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
