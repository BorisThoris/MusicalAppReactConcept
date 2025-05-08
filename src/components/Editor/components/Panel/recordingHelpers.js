const moveAndUpdateRecording = (el, delta) => {
    const recording = el.attrs['data-recording'];
    if (!recording) return;

    el.move({ x: delta * pixelToSecondRatio, y: 0 });
    el.setAttr('data-recording', {
        ...recording,
        endTime: recording.endTime + delta,
        startTime: recording.startTime + delta
    });
};

export const updateElementStartTime = ({ delta, element, pixelToSecondRatio }) => {
    if (!element) return;

    if (element.attrs['data-recording']) {
        moveAndUpdateRecording({ delta, el: element, pixelToSecondRatio });
    } else if (element.attrs['data-overlap-group']) {
        const group = element.attrs['data-overlap-group'];

        element.move({ x: delta * pixelToSecondRatio, y: 0 });
        Object.values(group.elements).forEach(({ element: subEl }) => {
            moveAndUpdateRecording({ delta, el: subEl, pixelToSecondRatio });
        });
    }
};

export const getElementsToModify = ({ pixelToSecondRatio, selectedValues }) => {
    if (!Array.isArray(selectedValues)) return [];
    return selectedValues.flatMap(({ element }) => {
        const group = element.attrs['data-overlap-group'];
        if (group?.elements) {
            return Object.values(group.elements).map(({ element: subEl }) => subEl);
        }
        return [element];
    });
};
