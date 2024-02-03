import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { Group, Layer, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';

const TimelineHeight = 200;
const Y_OFFSET = 20;
const ExpansionButtonSize = 20;

const InstrumentTimeline = React.memo(
    ({
        currentPlayingInstrument,
        deleteAllRecordingsForInstrument,
        focusedEvent,
        furthestEndTime,
        groupName,
        index,
        instrumentGroup,
        markersHeight,
        openPanel,
        panelCompensationOffset,
        panelFor,
        setFocusedEvent,
        updateStartTime
    }) => {
        const { mutedInstruments, replayInstrumentRecordings, toggleMute } = useContext(RecordingsPlayerContext);

        // State for panel expansion
        const [isExpanded, setIsExpanded] = useState(true);

        // Function to toggle expansion
        const toggleExpansion = useCallback(() => {
            setIsExpanded(!isExpanded);
        }, [isExpanded]);

        const isMuted = mutedInstruments.includes(groupName);

        const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
        const timelineWidth = furthestEndTime * pixelToSecondRatio;
        const fillColor = currentPlayingInstrument === groupName ? 'green' : 'transparent';

        const renderGroupElement = (groupData, groupIndex) => {
            const elementIsSelected = panelFor === groupData.id;
            return groupData.events.length === 1 ? (
                <SoundEventElement
                    updateStartTime={updateStartTime}
                    key={groupData.events[0].id}
                    timelineHeight={TimelineHeight}
                    recording={groupData.events[0]}
                    index={groupIndex}
                    openPanel={openPanel}
                    timelineY={timelineY}
                    isTargeted={elementIsSelected}
                    isFocused={groupData.events[0].id === focusedEvent}
                    setFocusedEvent={setFocusedEvent}
                />
            ) : (
                <OverlapGroupElement
                    key={`group-${groupIndex}`}
                    groupData={groupData}
                    index={groupIndex}
                    openPanel={openPanel}
                    timelineHeight={TimelineHeight}
                    timelineY={timelineY}
                    updateStartTime={updateStartTime}
                    isTargeted={elementIsSelected}
                    focusedEvent={focusedEvent}
                    setFocusedEvent={setFocusedEvent}
                />
            );
        };

        return (
            <Layer y={timelineY}>
                <Rect
                    offset={panelCompensationOffset}
                    height={TimelineHeight}
                    width={timelineWidth}
                    fill={isMuted ? 'red' : fillColor}
                />

                {/* Expansion button */}
                <Rect
                    x={timelineWidth - ExpansionButtonSize * 2} // Position the button to the left of the timeline's end
                    y={-ExpansionButtonSize / 2} // Center the button vertically relative to the timeline's top edge
                    width={ExpansionButtonSize}
                    height={ExpansionButtonSize}
                    fill={isExpanded ? '#CCCCCC' : '#AAAAAA'} // Change color based on expansion state
                    cornerRadius={5}
                    onClick={toggleExpansion}
                    draggable={false}
                />

                <Text
                    text={isExpanded ? '−' : '+'} // Use a dash for expanded state, plus for collapsed
                    fontSize={16}
                    fontFamily={'Arial'}
                    fill={'#333333'}
                    x={timelineWidth - ExpansionButtonSize * 1.5} // Center the text within the button
                    y={-ExpansionButtonSize / 2 + 5} // Adjust for font size
                    onClick={toggleExpansion}
                    draggable={false}
                />

                <InstrumentTimelinePanelComponent
                    timelineHeight={TimelineHeight}
                    groupName={groupName}
                    replayInstrumentRecordings={replayInstrumentRecordings}
                    deleteAllRecordingsForInstrument={deleteAllRecordingsForInstrument}
                    toggleMute={toggleMute}
                />

                {!isExpanded && (
                    <Group offset={panelCompensationOffset}>{instrumentGroup.map(renderGroupElement)}</Group>
                )}
            </Layer>
        );
    }
);

InstrumentTimeline.propTypes = {
    currentPlayingInstrument: PropTypes.string,
    deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
    focusedEvent: PropTypes.number,
    furthestEndTime: PropTypes.number.isRequired,
    groupName: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    instrumentGroup: PropTypes.arrayOf(
        PropTypes.shape({
            events: PropTypes.arrayOf(
                PropTypes.shape({
                    endTime: PropTypes.number.isRequired,
                    eventInstance: PropTypes.object,
                    id: PropTypes.number.isRequired,
                    instrumentName: PropTypes.string.isRequired,
                    startTime: PropTypes.number.isRequired
                })
            ).isRequired,
            id: PropTypes.number.isRequired
        })
    ).isRequired,
    markersHeight: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelCompensationOffset: PropTypes.object.isRequired,
    panelFor: PropTypes.number,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default InstrumentTimeline;
