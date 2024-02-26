export const isExactMatch = (event, eventSet) =>
    [...eventSet].some(
        (existingEvent) =>
            existingEvent.id === event.id &&
            existingEvent.startTime === event.startTime &&
            existingEvent.endTime === event.endTime
    );

export const createGroupFromEvent = (event, foundEvent) => {
    const existingEvent = foundEvent?.value;

    const mappedEvents = [];
    if (event.events?.length > 1) {
        event.events.forEach((e) => {
            mappedEvents.push({ ...e, events: undefined });
        });
    } else {
        mappedEvents.push({ ...event, events: undefined });
    }

    // DIRTY GROUP FIX
    if (!existingEvent) {
        return {
            ...event,
            endTime: event.endTime,
            events: mappedEvents,
            id: `${event.id}`,
            instrumentName: event.instrumentName,
            length: event.eventLength,
            locked: event.locked,
            startTime: event.startTime
        };
    }

    return existingEvent;
};
