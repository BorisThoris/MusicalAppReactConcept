import React, { useContext } from 'react';
import { Group } from 'react-konva';
import { PanelContext } from '../../../../hooks/usePanelState';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = ({ eventGroups, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);

    const { focusedEvent, openPanel, panelState, setFocusedEvent } = useContext(PanelContext);
    const panelFor = panelState?.overlapGroup?.id;

    return (
        <Group offset={timelineState.panelCompensationOffset}>
            {eventGroups.map((groupData, index) => {
                const elementIsSelected = panelFor === groupData.id;
                if (groupData.events && groupData.events.length === 1) {
                    return (
                        <SoundEventElement
                            key={groupData.events[0].id}
                            timelineHeight={timelineHeight}
                            recording={groupData.events[0]}
                            index={index}
                            openPanel={openPanel}
                            timelineY={timelineY}
                            isTargeted={elementIsSelected}
                            isFocused={groupData.events[0].id === focusedEvent}
                            setFocusedEvent={setFocusedEvent}
                            canvasOffsetY={timelineState.canvasOffsetY || undefined}
                        />
                    );
                }
                if (groupData.events && groupData.events.length > 1) {
                    return (
                        <OverlapGroupElement
                            key={`group-${index}`}
                            groupData={groupData}
                            index={index}
                            openPanel={openPanel}
                            timelineHeight={timelineHeight}
                            timelineY={timelineY}
                            isTargeted={elementIsSelected}
                            focusedEvent={focusedEvent}
                            setFocusedEvent={setFocusedEvent}
                            canvasOffsetY={timelineState.canvasOffsetY || undefined}
                        />
                    );
                }

                return null;
            })}
        </Group>
    );
};

export default TimelineEvents;
