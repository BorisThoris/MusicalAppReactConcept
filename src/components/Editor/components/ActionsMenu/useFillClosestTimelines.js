import React, { useEffect } from 'react';

export const useFillClosestTimelines = (closestTimelines) => {
    useEffect(() => {
        closestTimelines.forEach((timeline) => {
            if (timeline) {
                timeline.fill('yellow');
                timeline.getLayer().batchDraw();
            }
        });

        return () => {
            closestTimelines.forEach((timeline) => {
                if (timeline) {
                    timeline.fill('white');
                }
            });
        };
    }, [closestTimelines]);
};
