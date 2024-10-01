const isExactMatch = (event, eventSet) =>
    Object.values(eventSet).some(
        (existingEvent) =>
            existingEvent.id === event.id &&
            existingEvent.startTime === event.startTime &&
            existingEvent.endTime === event.endTime
    );

export const createGroupFromEvent = (event, foundEvent) => {
    const existingEventGroup = foundEvent?.value;

    const mappedEvents = {};
    if (event.events && Object.keys(event.events).length > 0) {
        Object.values(event.events).forEach((e) => {
            // Create a copy of the event with 'events' set to undefined.
            mappedEvents[e.id] = { ...e, events: undefined };
        });
    } else {
        // For single events or events without a nested structure, treat as a special case.
        mappedEvents[event.id] = { ...event, events: undefined };
    }

    // Determine group ID for parent assignment
    const groupId = existingEventGroup ? existingEventGroup.id : event.id;

    // Assign 'parent' property without returning the assignment
    const evts = Object.values(mappedEvents);

    if (evts.length > 1) {
        evts.forEach((e) => {
            if (e.id !== groupId) {
                e.parentId = groupId; // Assign parentId only if it's not the group ID
            }
        });
    }

    if (!existingEventGroup) {
        // Creating a new group, this time ensuring we do not return an assignment.
        return {
            ...event,
            endTime: event.endTime,
            events: mappedEvents,
            id: groupId, // Use the same logic for group ID as before
            instrumentName: event.instrumentName,
            length: event.eventLength,
            locked: event.locked || false,
            startTime: event.startTime
        };
    }
    // For an existing group, you should ensure that the existing group's event list is correctly updated
    // with the new or modified events. This might involve merging 'mappedEvents' with 'existingEventGroup.events'.
    // Make sure to handle duplicates or conflicts as needed, which depends on your application's requirements.

    // Assuming existingEventGroup.events is correctly updated elsewhere or prior to this function call.
    return existingEventGroup;
};
