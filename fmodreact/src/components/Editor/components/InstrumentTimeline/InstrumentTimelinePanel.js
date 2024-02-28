import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Text } from 'react-konva/';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';

const InstrumentTimelinePanel = ({
    deleteAllRecordingsForInstrument,
    groupName,
    isLocked,
    replayInstrumentRecordings,
    toggleLocked,
    toggleMute
}) => {
    const { duplicateInstrument } = useInstrumentRecordingsOperations();

    const onPlay = useCallback(() => {
        replayInstrumentRecordings(groupName);
    }, [groupName, replayInstrumentRecordings]);

    const onDelete = useCallback(() => {
        deleteAllRecordingsForInstrument(groupName);
    }, [deleteAllRecordingsForInstrument, groupName]);

    const onMute = useCallback(() => {
        toggleMute(groupName);
    }, [groupName, toggleMute]);

    const onCopy = useCallback(() => {
        duplicateInstrument({ instrumentName: groupName });
    }, [duplicateInstrument, groupName]);

    // Dynamically add icons based on groupName (instrumentName), with case-insensitive checks
    const icons = useMemo(() => {
        const baseIcons = [
            { callback: onPlay, icon: '▶' },
            { callback: onDelete, icon: '🗑️' },
            { callback: onMute, icon: '🔇' },
            { callback: toggleLocked, icon: isLocked ? '🔒' : '🔓' },
            { callback: onCopy, icon: '📄' }
        ];

        const groupNameLower = groupName.toLowerCase();

        // Dynamically adding specific actions for different instruments
        if (groupNameLower.includes('guitar')) {
            baseIcons.push({ callback: () => alert('Guitar-specific action'), icon: '🎸' });
        }
        if (groupNameLower.includes('drum')) {
            baseIcons.push({ callback: () => alert('Drums-specific action'), icon: '🥁' });
        }
        if (groupNameLower.includes('tambourine')) {
            baseIcons.push({ callback: () => alert('Tambourine-specific action'), icon: '🎵' });
        }
        if (groupNameLower.includes('piano')) {
            baseIcons.push({ callback: () => alert('Piano-specific action'), icon: '🎹' });
        }

        return baseIcons;
    }, [groupName, isLocked, onCopy, onDelete, onMute, onPlay, toggleLocked]);

    const [widths, setWidths] = useState(Array(icons.length).fill(0));
    const [heights, setHeights] = useState(Array(icons.length).fill(0));
    const textRefs = useRef(icons.map(() => React.createRef()));

    useEffect(() => {
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

    let accumulatedHeight = groupName ? 20 : 0;
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
    deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
    groupName: PropTypes.string,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number,
    toggleLocked: PropTypes.func.isRequired,
    toggleMute: PropTypes.func.isRequired
};

export default InstrumentTimelinePanel;
