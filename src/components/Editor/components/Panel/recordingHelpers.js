import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

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

export const updateElementStartTime = (element, delta) => {
    if (!element) return;

    if (element.attrs['data-recording']) {
        moveAndUpdateRecording(element, delta);
    } else if (element.attrs['data-overlap-group']) {
        const group = element.attrs['data-overlap-group'];

        element.move({ x: delta * pixelToSecondRatio, y: 0 });
        Object.values(group.elements).forEach(({ element: subEl }) => {
            moveAndUpdateRecording(subEl, delta);
        });
    }
};

export const getElementsToModify = (selectedValues) => {
    if (!Array.isArray(selectedValues)) return [];
    return selectedValues.flatMap(({ element }) => {
        const group = element.attrs['data-overlap-group'];
        if (group?.elements) {
            return Object.values(group.elements).map(({ element: subEl }) => subEl);
        }
        return [element];
    });
};
