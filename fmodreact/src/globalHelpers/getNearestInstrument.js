export const getNearestInstrument = ({ deltaY, groupNode, timelineRefs }) => {
    if (!groupNode) {
        console.error('Group node ref is not available.');
        return null;
    }

    const targetRect = groupNode.getAbsolutePosition();
    const adjustedY = targetRect.y + deltaY;

    let nearestTimeline = null;
    let minYDistance = Infinity;

    Object.entries(timelineRefs).forEach(([instrumentName, ref]) => {
        // Use Object.entries to iterate over the keys and values
        if (!ref) {
            console.warn(`Ref for instrument ${instrumentName} is not set.`);
            return;
        }

        const timelineRect = ref.getAbsolutePosition();
        const timelineCenterY = timelineRect.y;

        const yDistance = Math.abs(adjustedY - timelineCenterY);

        if (yDistance < minYDistance) {
            minYDistance = yDistance;
            nearestTimeline = instrumentName;
        }
    });

    return nearestTimeline;
};

export default getNearestInstrument;
