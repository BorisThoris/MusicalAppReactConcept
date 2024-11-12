import React, { useContext } from 'react';
import styled from 'styled-components';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import PasteButton from './PasteButton';

const MenuContainer = styled.div`
    background: #c3c7cb;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #808080;
    font-family: Arial, sans-serif;
    font-size: 14px;
    padding: 5px;
    position: absolute;
    width: 150px;
    z-index: 1000;
    left: ${({ position }) => `${position.x}px`};
    top: ${({ position }) => `${position.y}px`};
`;

const MenuList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const MenuItem = styled.div`
    background: #ece9d8;
    cursor: pointer;
    padding: 5px;

    &:focus {
        outline: none;
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
