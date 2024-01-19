export const isExactMatch = (event, eventSet) =>
    [...eventSet].some(
        (existingEvent) =>
            existingEvent.id === event.id &&
            existingEvent.startTime === event.startTime &&
            existingEvent.endTime === event.endTime
    );

export const createGroupFromEvent = (event, foundEvent) => {
    const existingEvent = foundEvent?.value;

    if (!existingEvent) {
        return {
            endTime: event.endTime,
            events: [event],
            id: `${event.id}Group`,
            instrumentName: event.instrumentName,
            length: event.eventLength,
            locked: event.locked,
            startTime: event.startTime,
        };
    }

    return existingEvent;
};
