import PropTypes from 'prop-types';
import React from 'react';
import { Layer, Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const TimelineHeight = 200;

const InstrumentTimeline = ({
    instrumentGroup,
    openPanel,
    updateStartTime,
}) => {
    const handleDragEnd = ({ e, eventLength, index, instrumentName }) => {
        const newStartTime = e.target.x() / pixelToSecondRatio;
        updateStartTime({ eventLength, index, instrumentName, newStartTime });
    };

    return (
        <Stage width={window.innerWidth} height={TimelineHeight}>
            <Layer>
                {instrumentGroup.map((recording, index) => (
                    <SoundEventElement
                        key={index}
                        timelineHeight={TimelineHeight}
                        recording={recording}
                        index={index}
                        openPanel={openPanel}
                        handleDragEnd={handleDragEnd}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

InstrumentTimeline.propTypes = {
    instrumentGroup: PropTypes.arrayOf(PropTypes.object).isRequired,
    openPanel: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
