// PasteButton.js
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { getElementScreenPosition } from '../../../../globalHelpers/getElementScreenPosition';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { markersAndTrackerOffset } from '../../../../providers/TimelineProvider';
import { useFillClosestTimelines } from './useFillClosestTimelines';
import { useFindClosestTimelines } from './useFindClosestTimelines';

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

const PreviewOverlay = styled.div`
    position: absolute;
    background: ${({ theme }) => theme.colors.primary[500]}40;
    height: 50px;
    z-index: 999;
    pointer-events: none;
    left: ${({ position }) => `${position.x}px`};
    top: ${({ position }) => `${position.y}px`};
    width: ${({ width }) => `${width}px`};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const PasteButton = ({ copiedEvents, menuPosition }) => {
    const pixelToSecondRatio = usePixelRatio();

    const { duplicateEventsToInstrument } = useInstrumentRecordingsOperations();
    const { hideActionsMenu } = useContext(PanelContext);

    const [isHovering, setIsHovering] = useState(false);

    const { closestTimelines } = useFindClosestTimelines({
        copiedEvents,
        isHovering,
        menuPosition
    });

    useFillClosestTimelines(Object.values(closestTimelines));

    const handlePaste = useCallback(() => {
        const duplicationMap = copiedEvents.map((event) => {
            const closestTimelineName = closestTimelines[event.id].parent.attrs['data-instrument-name'];

            return { ...event, targetInstrumentName: closestTimelineName };
        });

        duplicateEventsToInstrument({
            eventsToDuplicate: duplicationMap,
            newStartTime: menuPosition.x / pixelToSecondRatio
        });

        hideActionsMenu();
    }, [
        closestTimelines,
        copiedEvents,
        duplicateEventsToInstrument,
        hideActionsMenu,
        menuPosition.x,
        pixelToSecondRatio
    ]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handlePaste();
            }
        },
        [handlePaste]
    );

    const onHover = useCallback(() => setIsHovering(true), []);

    const onBlur = useCallback(() => setIsHovering(false), []);

    // Find the earliest start time in copied events to use as a baseline
    const baseStartTime = Math.min(...copiedEvents.map((e) => e.startTime));

    const generatePreviews = useCallback(() => {
        const previews = copiedEvents.map((event, index) => {
            const relativeStartX = (event.startTime - baseStartTime) * pixelToSecondRatio;
            const eventWidth = event.eventLength * pixelToSecondRatio;
            const closestTimeline = closestTimelines[event.id];

            return (
                <PreviewOverlay
                    key={index}
                    // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
                    position={{
                        x: relativeStartX,
                        y: closestTimeline
                            ? getElementScreenPosition(closestTimeline).y + markersAndTrackerOffset - menuPosition.y
                            : event.rect.y - markersAndTrackerOffset
                    }}
                    width={eventWidth}
                />
            );
        });

        return previews;
    }, [baseStartTime, closestTimelines, copiedEvents, menuPosition.y, pixelToSecondRatio]);

    return (
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

            {isHovering && generatePreviews()}
        </>
    );
};

export default PasteButton;
