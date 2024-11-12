/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { createEvent, createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

export const useInstrumentRecordingsOperations = () => {
    const { getSoundEventById, setOverlapGroups } = useContext(CollisionsContext);

    const updateGroups = (setOverlapGroups, updateCallback) => {
        setOverlapGroups((prevGroups) => {
            const updatedGroups = cloneDeep(prevGroups);
            updateCallback(updatedGroups);

            return updatedGroups;
        });
    };

    const getEventById = useCallback(
        (id) => {
            const element = getSoundEventById(id);
            return element?.recording;
        },
        [getSoundEventById]
    );

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                updatedGroups[instrumentName] = {};
            });
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        ({ event, updatedParam }) => {
            const { id: eventId, instrumentName } = event;

            updateGroups(setOverlapGroups, (updatedGroups) => {
                const updateParamsInEvent = (event) => {
                    if (event.id === eventId) {
                        return {
                            ...event,
                            params: event.params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };
                    }

                    return event;
                };

                const instrumentRecordings = updatedGroups[instrumentName];

                instrumentRecordings[eventId] = updateParamsInEvent(event);
            });
        },
        [setOverlapGroups]
    );

    const lockOverlapGroup = useCallback(() => {}, []);

    const updateOverlapGroupTimes = useCallback(() => {}, [], []);

    const deleteOverlapGroup = useCallback(() => {}, []);

    const deleteAllRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                delete updatedGroups[instrumentName];
            });
        },
        [setOverlapGroups]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            const elapsedTime = getElapsedTime(startTime, startOffset);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: startOffset || startOffset === 0 ? elapsedTime : startTime
            });

            const newGroup = {
                ...event,
                events: { [event.id]: { ...event, parentId: event.id } },
                locked: false
            };

            updateGroups(setOverlapGroups, (updatedGroups) => {
                if (!updatedGroups[instrumentName]) {
                    updatedGroups[instrumentName] = {};
                }
                updatedGroups[instrumentName][event.id] = newGroup;
            });
        },
        [setOverlapGroups]
    );

    const duplicateEventsToInstrument = useCallback(
        ({ eventsToDuplicate, newStartTime = null }) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                // Determine the instrument to which the events will be added

                // Calculate the time offset if a new start time is provided
                const baseStartTime = eventsToDuplicate[0]?.startTime || 0;
                const startOffset = newStartTime !== null ? newStartTime - baseStartTime : 0;

                eventsToDuplicate.forEach((event) => {
                    const targetInstrumentName = event.targetInstrumentName;

                    // Initialize target instrument if it doesn't exist in updatedGroups
                    if (!updatedGroups[targetInstrumentName]) {
                        updatedGroups[targetInstrumentName] = {};
                    }

                    const newEvent = { ...event, locked: true };

                    // Calculate the new start time for each event, maintaining relative order
                    const adjustedStartTime = newStartTime !== null ? event.startTime + startOffset : event.startTime;

                    // Recreate each event using createEvent to ensure deep cloning and unique IDs
                    const duplicatedEvent = createEvent({
                        instrumentName: targetInstrumentName,
                        passedStartTime: adjustedStartTime,
                        recording: newEvent
                    });

                    // Add the duplicated event to the target instrument in updatedGroups
                    updatedGroups[targetInstrumentName][duplicatedEvent.id] = duplicatedEvent;
                });
            });
        },
        [setOverlapGroups]
    );

    const duplicateInstrument = useCallback(
        (instrumentName) => {
            const newInstrumentName = `${instrumentName} Copy`;

            updateGroups(setOverlapGroups, (updatedGroups) => {
                const originalInstrumentRecordings = updatedGroups[instrumentName];

                if (!originalInstrumentRecordings) {
                    console.warn(`Instrument "${newInstrumentName}" does not exist.`);
                    return;
                }

                const newInstrumentRecordings = {};

                // Recreate all events using createEvent
                Object.values(originalInstrumentRecordings).forEach((recording) => {
                    // Recreate the event using createEvent
                    const newEvent = createEvent({
                        instrumentName: newInstrumentName,
                        passedStartTime: recording.startTime,
                        recording
                    });

                    // Add the new event to the new instrument recordings
                    newInstrumentRecordings[newEvent.id] = newEvent;
                });

                // Add the new instrument and its recordings to the updated groups
                updatedGroups[newInstrumentName] = newInstrumentRecordings;
            });
        },
        [setOverlapGroups]
    );

    const resetRecordings = useCallback(
        (instrumentName) => {
            if (instrumentName) {
                resetRecordingsForInstrument(instrumentName);
            } else {
                setOverlapGroups({});
            }
        },
        [resetRecordingsForInstrument, setOverlapGroups]
    );

    return {
        addRecording: recordSoundEvent,
        deleteAllRecordingsForInstrument,
        deleteOverlapGroup,
        duplicateEventsToInstrument,
        duplicateInstrument,

        getEventById,
        lockOverlapGroup,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
