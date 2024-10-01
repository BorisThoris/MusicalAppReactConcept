import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Group } from 'react-konva';

export const Portal = ({ children, enabled, selector }) => {
    // "selector" is a string to find another container to insert all internals
    // it can be like ".top-layer" or "#overlay-group"
    const outer = useRef(null);
    const inner = useRef(null);

    const safeRef = useRef();
    const shouldMove = enabled !== undefined ? enabled : true;

    useLayoutEffect(() => {
        if (!outer.current || !inner.current) {
            return;
        }
        safeRef.current = inner.current;
        const stage = outer.current.getStage();
        const newContainer = stage.findOne(selector);
        if (shouldMove && newContainer) {
            inner.current.moveTo(newContainer);
        } else {
            inner.current.moveTo(outer.current);
        }

        // manually redraw layers
        const outerLayer = outer.current.getLayer();

        if (!outerLayer) return;

        outerLayer.batchDraw();
        if (newContainer) {
            const newContainerLayer = newContainer.getLayer();

            if (!newContainerLayer) return;

            newContainerLayer.batchDraw();
        }
    }, [selector, shouldMove]);

    useEffect(() => {
        return () => {
            // manually destroy
            safeRef.current?.destroy();
        };
    }, []);

    // For smooth movement we will have to use two groups
    // outer - is the main container, will be placed in the old position
    // inner - that we will move into another container
    return (
        <Group name="_outer_portal" ref={outer}>
            <Group name="_inner_portal" ref={inner}>
                {children}
            </Group>
        </Group>
    );
};
