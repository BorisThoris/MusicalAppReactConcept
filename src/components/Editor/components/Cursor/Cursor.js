import React from 'react';
import { Group, Layer, Path } from 'react-konva';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';

export const Cursor = () => {
    const { cursorPos, handleClick, pointerPath } = useCustomCursorContext();

    return (
        <Layer>
            <Group x={cursorPos.x} y={cursorPos.y} listening={false} onClick={handleClick}>
                <Path data={pointerPath} fill="black" />
            </Group>
        </Layer>
    );
};
