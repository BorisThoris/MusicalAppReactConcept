export const isExactMatch = (event, eventSet) =>
    [...eventSet].some(
        (existingEvent) =>
            existingEvent.id === event.id &&
            existingEvent.startTime === event.startTime &&
            existingEvent.endTime === event.endTime
    );

export const createGroupFromEvent = (event) => ({
    endTime: event.endTime,
    events: [event],
    id: event.id,
    instrumentName: event.instrumentName,
    locked: event.locked,
    startTime: event.startTime,
});
