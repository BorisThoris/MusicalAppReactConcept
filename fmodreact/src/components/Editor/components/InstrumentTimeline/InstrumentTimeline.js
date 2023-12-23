import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Group, Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';

const TimelineHeight = 200;
const Y_OFFSET = 20;

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
        updateStartTime,
    }) => {
        const { mutedInstruments, replayInstrumentRecordings, toggleMute } =
            useContext(RecordingsPlayerContext);

        const isMuted = mutedInstruments.includes(groupName);

        const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
        const timelineWidth = furthestEndTime * pixelToSecondRatio;
        const fillColor =
            currentPlayingInstrument === groupName ? 'green' : 'transparent';

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

                <InstrumentTimelinePanelComponent
                    timelineHeight={TimelineHeight}
                    groupName={groupName}
                    replayInstrumentRecordings={replayInstrumentRecordings}
                    deleteAllRecordingsForInstrument={
                        deleteAllRecordingsForInstrument
                    }
                    toggleMute={toggleMute}
                />

                <Group offset={panelCompensationOffset}>
                    {instrumentGroup.map(renderGroupElement)}
                </Group>
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
                    startTime: PropTypes.number.isRequired,
                })
            ).isRequired,
            id: PropTypes.number.isRequired,
        })
    ).isRequired,
    markersHeight: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelCompensationOffset: PropTypes.object.isRequired,
    panelFor: PropTypes.number,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
