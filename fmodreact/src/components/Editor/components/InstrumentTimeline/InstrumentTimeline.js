import PropTypes from 'prop-types';
import React from 'react';
import { Layer } from 'react-konva';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement'; // New component for overlapping elements

const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = ({
    index,
    instrumentGroup,
    markersHeight,
    openPanel,
    panelFor,
    stopPlayback,
    updateStartTime,
}) => {
    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;

    return (
        <Layer y={timelineY}>
            {instrumentGroup.map((groupData, groupIndex) => {
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
                        stopPlayback={stopPlayback}
                        isTargeted={elementIsSelected}
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
                    />
                );
            })}
        </Layer>
    );
};

InstrumentTimeline.propTypes = {
    index: PropTypes.number.isRequired,
    instrumentGroup: PropTypes.arrayOf(
        PropTypes.shape({
            endTime: PropTypes.number,
            eventInstance: PropTypes.object,
            instrumentName: PropTypes.string,
            startTime: PropTypes.number,
        })
    ).isRequired,
    markersHeight: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelFor: PropTypes.number,
    stopPlayback: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
