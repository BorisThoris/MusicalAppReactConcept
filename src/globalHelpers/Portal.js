import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Group } from 'react-konva';

export const Portal = ({ children, enabled, outerRef, selector }) => {
    // "selector" is a string to find another container to insert all internals
    // it can be like ".top-layer" or "#overlay-group"

    const inner = useRef(null);

    const safeRef = useRef();
    const shouldMove = enabled !== undefined ? enabled : true;

    useLayoutEffect(() => {
        if (!outerRef.current || !inner.current) {
            return;
        }
        safeRef.current = inner.current;
        const stage = outerRef.current.getStage();
        const newContainer = stage.findOne(selector);
        if (shouldMove && newContainer) {
            inner.current.moveTo(newContainer);
        } else {
            inner.current.moveTo(outerRef.current);
        }

        // manually redraw layers
        const outerLayer = outerRef.current.getLayer();

        if (!outerLayer) return;

        outerLayer.batchDraw();
        if (newContainer) {
            const newContainerLayer = newContainer.getLayer();

            if (!newContainerLayer) return;

            newContainerLayer.batchDraw();
        }
    }, [outerRef, selector, shouldMove]);

    useEffect(() => {
        return () => {
            // manually destroy
            safeRef.current?.destroy();
        };
    }, []);

    // For smooth movement we will have to use two groups
    // outerRef - is the main container, will be placed in the old position
    // inner - that we will move into another container
    return (
        <Group name="_outer_portal" ref={outerRef}>
            <Group name="_inner_portal" ref={inner}>
                {children}
            </Group>
        </Group>
    );
};
