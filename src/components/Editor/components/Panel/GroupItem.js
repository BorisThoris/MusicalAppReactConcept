import React, { useCallback, useContext } from 'react';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { EventHeader } from './EventHeader';
import { EventItem } from './EventItem';
import { updateElementStartTime } from './recordingHelpers';
import TimeControl from './TimeControl';

const GroupItem = ({ event }) => {
    const pixelToSecondRatio = usePixelRatio();
    const { element, elements, endTime, startTime } = event;
    const { copyEvents, stageRef } = useContext(CollisionsContext);
    const { deleteSelections } = useContext(SelectionContext);

    const groupElements = elements && Object.values(elements);

    const handleDelete = useCallback(() => {
        element.destroy();
        deleteSelections(event);
        stageRef?.findOne('.top-layer')?.batchDraw();
    }, [element, deleteSelections, event, stageRef]);

    const handleModifyStartTime = useCallback(
        ({ delta }) => updateElementStartTime({ delta, element, pixelToSecondRatio }),
        [element, pixelToSecondRatio]
    );

    const handleCopy = useCallback(() => copyEvents(event), [copyEvents, event]);

    return (
        <div>
            <EventHeader onDelete={handleDelete} onCopy={handleCopy} />
            <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={handleModifyStartTime} />

            {groupElements.map((ev) => {
                return <EventItem key={ev.id} event={ev} />;
            })}
        </div>
    );
};

export default GroupItem;
