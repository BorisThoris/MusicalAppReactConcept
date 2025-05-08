import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Group, Layer, Line, Text } from 'react-konva';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const TimeMarker = ({ duration, height, pixelToSecond }) => {
    const pixelToSecondRatio = usePixelRatio();
    const { timelineState } = useContext(TimelineContext);

    const [width, setWidth] = useState(180 * pixelToSecondRatio);
    const markerHeight = 10;
    const secondMarkerHeight = 20;
    const refsArray = useRef([]); // Refs array to hold all marker refs

    const setRef = (el) => {
        refsArray.current.push(el);
    };

    const calculatePoints = useCallback(
        (xPosition, markerLen) => [xPosition, height, xPosition, height - markerLen],
        [height]
    );

    const createMarker = useCallback(
        (time, xPosition) => {
            const isSecond = time % 1000 === 0;
            const label = isSecond ? `${time / 1000}s` : `${time}ms`;
            const markerLen = isSecond ? secondMarkerHeight : markerHeight;

            return (
                <Group key={time} ref={setRef}>
                    <Text x={xPosition} y={height - markerLen - 15} text={label} fontSize={12} fill="red" />
                    <Line points={calculatePoints(xPosition, markerLen)} stroke="red" strokeWidth={2} />
                </Group>
            );
        },
        [calculatePoints, height]
    );

    const markers = useMemo(() => {
        const markersArray = [];
        const maxMarkers = width / 50;
        const interval = Math.round(duration / maxMarkers);

        for (let i = 0; i <= duration; i += interval) {
            const xPosition = (i * pixelToSecond) / 1000;
            markersArray.push(createMarker(i, xPosition));
        }

        return markersArray;
    }, [createMarker, duration, pixelToSecond, width]);

    // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
    return <Layer offset={timelineState.panelCompensationOffset}>{markers}</Layer>;
};

TimeMarker.propTypes = {
    duration: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    pixelToSecond: PropTypes.number.isRequired
};

export default React.memo(TimeMarker);
