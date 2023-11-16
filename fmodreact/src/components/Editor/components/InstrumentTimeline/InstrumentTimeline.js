import PropTypes from 'prop-types';
import React from 'react';
import { Layer } from 'react-konva';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = ({
    index,
    instrumentGroup,
    markersHeight,
    openPanel,
    stopPlayback,
    updateStartTime,
}) => {
    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;

    return (
        <Layer y={timelineY}>
            {instrumentGroup.map((recording, groupIndex) => (
                <SoundEventElement
                    updateStartTime={updateStartTime}
                    key={groupIndex}
                    timelineHeight={TimelineHeight}
                    recording={recording}
                    index={groupIndex}
                    openPanel={openPanel}
                    timelineY={timelineY}
                    stopPlayback={stopPlayback}
                />
            ))}
        </Layer>
    );
};

InstrumentTimeline.propTypes = {
    index: PropTypes.number.isRequired,
    instrumentGroup: PropTypes.arrayOf(
        PropTypes.shape({
            eventInstance: PropTypes.object,
            instrumentName: PropTypes.string,
            startTime: PropTypes.number,
        })
    ).isRequired,
    markersHeight: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    stopPlayback: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
