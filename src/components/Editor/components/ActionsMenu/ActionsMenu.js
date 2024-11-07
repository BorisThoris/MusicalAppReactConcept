import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import PasteOverview from './PastePreview';

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

const ActionsMenu = ({ handleHideMenu, menuPosition }) => {
    const { duplicateEventsToInstrument } = useInstrumentRecordingsOperations();
    const { copiedEvents } = useContext(CollisionsContext);
    const [isHovering, setIsHovering] = useState(false);

    const handlePaste = useCallback(() => {
        duplicateEventsToInstrument({ events: copiedEvents, newStartTime: menuPosition.x / pixelToSecondRatio });
        handleHideMenu();
    }, [copiedEvents, duplicateEventsToInstrument, handleHideMenu, menuPosition.x]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleHideMenu();
            }
        },
        [handleHideMenu]
    );

    const onHover = useCallback(() => setIsHovering(true), []);
    const onBlur = useCallback(() => setIsHovering(false), []);

    return (
        <>
            <MenuContainer position={menuPosition}>
                <MenuList>
                    {copiedEvents.length > 0 && (
                        <>
                            <MenuItem
                                onClick={handlePaste}
                                onKeyDown={handleKeyDown}
                                onMouseEnter={onHover}
                                onMouseLeave={onBlur}
                                role="button"
                                tabIndex={0}
                            >
                                Paste
                            </MenuItem>
                            <PasteOverview menuPosition={menuPosition} isHovering={isHovering} />
                        </>
                    )}
                </MenuList>
            </MenuContainer>
        </>
    );
};

export default ActionsMenu;
