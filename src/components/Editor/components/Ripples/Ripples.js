import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Circle, Group } from 'react-konva';

// Assuming findDifferences function is defined elsewhere if needed

const Ripple = React.memo(({ color = 'lightBlue', id, onFinish, x, y }) => {
    const circleRef = useRef(null);

    useEffect(() => {
        const tween = new Konva.Tween({
            duration: 1,
            node: circleRef.current,
            onFinish: () => {
                onFinish(id);
                tween.destroy();
            },
            opacity: 0,
            radius: 130,
            strokeWidth: 0
        });
        tween.play();
        // Removed circleRef from the dependencies
    }, [id, onFinish]);

    return <Circle ref={circleRef} x={x} y={y} radius={1} stroke={color} strokeWidth={2} opacity={1} />;
});

export const Ripples = ({ removeRipple, ripples }) => {
    return (
        <Group listening={false}>
            {ripples.map(({ color, id, x, y }) => (
                <Ripple key={`${id}`} id={id} x={x} y={y} color={color} onFinish={removeRipple} />
            ))}
        </Group>
    );
};
