import PropTypes from 'prop-types';
import React from 'react';
import { Layer } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = ({
    index,
    instrumentGroup,
    markersHeight,
    openPanel,
    updateStartTime,
}) => {
    const handleDragEnd = ({
        e,
        elementIndex,
        eventLength,
        instrumentName,
    }) => {
        const newStartTime = e.target.x() / pixelToSecondRatio;
        updateStartTime({
            eventLength,
            index: elementIndex,
            instrumentName,
            newStartTime,
        });
    };

    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;

    return (
        <Layer y={timelineY}>
            {instrumentGroup.map((recording, groupIndex) => (
                <SoundEventElement
                    key={groupIndex}
                    timelineHeight={TimelineHeight}
                    recording={recording}
                    index={groupIndex}
                    openPanel={openPanel}
                    handleDragEnd={handleDragEnd}
                    timelineY={timelineY}
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
    updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
