import React from 'react';
import { Group } from 'react-konva';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = ({
    canvasOffsetY,
    eventGroups,
    focusedEvent,
    openPanel,
    panelFor,
    setFocusedEvent,
    timelineHeight,
    timelineY,
    updateStartTime
}) => {
    return (
        <Group offset={canvasOffsetY}>
            {eventGroups.map((groupData, index) => {
                const elementIsSelected = panelFor === groupData.id;
                if (groupData.events && groupData.events.length === 1) {
                    // Render SoundEventElement for single events
                    return (
                        <SoundEventElement
                            updateStartTime={updateStartTime}
                            key={groupData.events[0].id}
                            timelineHeight={timelineHeight}
                            recording={groupData.events[0]}
                            index={index}
                            openPanel={openPanel}
                            timelineY={timelineY}
                            isTargeted={elementIsSelected}
                            isFocused={groupData.events[0].id === focusedEvent}
                            setFocusedEvent={setFocusedEvent}
                            canvasOffsetY={canvasOffsetY}
                        />
                    );
                }
                if (groupData.events && groupData.events.length > 1) {
                    // Render OverlapGroupElement for event groups
                    return (
                        <OverlapGroupElement
                            key={`group-${index}`}
                            groupData={groupData}
                            index={index}
                            openPanel={openPanel}
                            timelineHeight={timelineHeight}
                            timelineY={timelineY}
                            updateStartTime={updateStartTime}
                            isTargeted={elementIsSelected}
                            focusedEvent={focusedEvent}
                            setFocusedEvent={setFocusedEvent}
                            canvasOffsetY={canvasOffsetY}
                        />
                    );
                }
                // In case there's an unexpected structure
                return null;
            })}
        </Group>
    );
};

export default TimelineEvents;
