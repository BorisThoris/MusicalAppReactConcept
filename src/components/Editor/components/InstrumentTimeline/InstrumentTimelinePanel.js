import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Text } from 'react-konva/';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';

const InstrumentTimelinePanel = ({ parentGroupName, replayInstrumentRecordings, toggleMute }) => {
    const { deleteAllRecordingsForInstrument, duplicateInstrument } = useInstrumentRecordingsOperations();

    const onPlay = useCallback(() => {
        replayInstrumentRecordings(parentGroupName);
    }, [parentGroupName, replayInstrumentRecordings]);

    const onDelete = useCallback(() => {
        deleteAllRecordingsForInstrument(parentGroupName);
    }, [parentGroupName, deleteAllRecordingsForInstrument]);

    const onMute = useCallback(() => {
        toggleMute(parentGroupName);
    }, [parentGroupName, toggleMute]);

    const onDuplicate = useCallback(() => {
        duplicateInstrument(parentGroupName);
    }, [duplicateInstrument, parentGroupName]);

    // Icons with their corresponding callbacks
    const icons = useMemo(
        () => [
            { callback: onPlay, icon: '▶' }, // Play
            { callback: onDelete, icon: '🗑️' }, // Delete
            { callback: onMute, icon: '🔇' }, // Mute
            { callback: onDuplicate, icon: '📄' } // Duplicate
        ],
        [onPlay, onDelete, onMute, onDuplicate]
    );

    // Create refs for each icon
    const textRefs = useRef(icons.map(() => React.createRef()));

    const [widths, setWidths] = useState([]);
    const [heights, setHeights] = useState([]);

    useEffect(() => {
        // Update widths and heights dynamically based on text elements
        const newWidths = textRefs.current.map((ref) => (ref.current ? ref.current.getTextWidth() : 0));
        const newHeights = textRefs.current.map((ref) => (ref.current ? ref.current.textHeight : 0));
        setWidths(newWidths);
        setHeights(newHeights);
    }, [textRefs]);

    let parentWidth = 0;
    if (textRefs.current[0] && textRefs.current[0].current) {
        const { parent } = textRefs.current[0].current;
        if (parent) {
            parentWidth = 25;
        }
    }

    // Dynamically calculate Y positions based on the heights of icons
    let accumulatedHeight = parentGroupName ? 20 : 0;
    const yPositions = heights.map((h) => {
        const yPos = accumulatedHeight;
        accumulatedHeight += h + 2;
        return yPos;
    });

    const groupScale = useMemo(() => ({ x: 2, y: 2 }), []);

    const x = useCallback((index) => (parentWidth ? (parentWidth - widths[index]) / 2 : 0), [parentWidth, widths]);

    return (
        <Group scale={groupScale}>
            {icons.map((icon, index) => (
                <Text
                    key={icon.icon}
                    text={icon.icon}
                    x={x(index)}
                    y={yPositions[index]}
                    ref={textRefs.current[index]}
                    onClick={icon.callback}
                />
            ))}
        </Group>
    );
};

InstrumentTimelinePanel.propTypes = {
    parentGroupName: PropTypes.string,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    toggleMute: PropTypes.func.isRequired
};

export default InstrumentTimelinePanel;
