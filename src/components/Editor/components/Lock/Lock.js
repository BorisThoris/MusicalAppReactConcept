import React from 'react';
import { Text } from 'react-konva';

export const Lock = ({ isLocked, onClick }) => {
    return <Text onClick={onClick} x={-10} y={-10} text={isLocked ? '🔒' : '✔️'} fontSize={18} fill="white" />;
};
