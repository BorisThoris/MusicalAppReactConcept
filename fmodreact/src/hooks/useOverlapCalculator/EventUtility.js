export const isExactMatch = (event, eventSet) =>
    [...eventSet].some(
        (existingEvent) =>
            existingEvent.id === event.id &&
            existingEvent.startTime === event.startTime &&
            existingEvent.endTime === event.endTime
    );

export const createGroupFromEvent = (event, foundEvent) => {
    const existingEventGroup = foundEvent?.value;

    const mappedEvents = [];
    if (event.events?.length > 1) {
        event.events.forEach((e) => {
            // Simply creating a copy of the event with 'events' set to undefined.
            const eventCopy = { ...e, events: undefined };
            mappedEvents.push(eventCopy);
        });
    } else {
        const singleEventCopy = { ...event, events: undefined };
        mappedEvents.push(singleEventCopy); // For single events, similar to above.
    }

    // Determine group ID for parent assignment
    const groupId = existingEventGroup ? existingEventGroup.id : `${event.id}`;

    // Assign 'parent' property without returning the assignment
    mappedEvents.forEach((e) => {
        if (e.id !== groupId) e.parent = groupId;
    });

    if (!existingEventGroup) {
        // Creating a new group, this time ensuring we do not return an assignment.
        return {
            ...event,
            endTime: event.endTime,
            events: mappedEvents,
            id: groupId, // Use the same logic for group ID as before
            instrumentName: event.instrumentName,
            length: event.eventLength,
            locked: event.locked,
            startTime: event.startTime
        };
    }
    // For an existing group, you should ensure that the existing group's event list is correctly updated
    // with the new or modified events. This might involve merging 'mappedEvents' with 'existingEventGroup.events'.
    // Make sure to handle duplicates or conflicts as needed, which depends on your application's requirements.

    // Assuming existingEventGroup.events is correctly updated elsewhere or prior to this function call.
    return existingEventGroup;
};
