const moveElementX = (el, deltaX) => {
    if (el?.move) el.move({ x: deltaX, y: 0 });
};

const updateRecordingTimes = (recording, delta) => {
    return {
        ...recording,
        endTime: recording.endTime + delta,
        startTime: recording.startTime + delta
    };
};

const moveAndUpdateRecording = ({ delta, el, pixelToSecondRatio }) => {
    const recording = el?.attrs?.['data-recording'];
    if (!recording) return;

    const deltaX = delta * pixelToSecondRatio;
    moveElementX(el, deltaX);
    el.setAttr('data-recording', updateRecordingTimes(recording, delta));
};

export const updateElementStartTime = ({ delta, element, pixelToSecondRatio }) => {
    if (!element?.attrs) return;

    const deltaX = delta * pixelToSecondRatio;

    const recording = element.attrs['data-recording'];
    if (recording) {
        moveAndUpdateRecording({ delta, el: element, pixelToSecondRatio });
        return;
    }

    const group = element.attrs['data-overlap-group'];
    if (group?.elements) {
        moveElementX(element, deltaX);
        Object.values(group.elements).forEach(({ element: subEl }) =>
            moveAndUpdateRecording({ delta, el: subEl, pixelToSecondRatio })
        );
    }
};

export const getElementsToModify = ({ pixelToSecondRatio, selectedValues }) => {
    if (!Array.isArray(selectedValues)) return [];
    return selectedValues.flatMap(({ element }) => {
        const group = element.attrs?.['data-overlap-group'];
        return group?.elements ? Object.values(group.elements).map(({ element: subEl }) => subEl) : [element];
    });
};
