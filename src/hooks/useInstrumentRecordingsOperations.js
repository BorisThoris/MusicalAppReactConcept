/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import find from 'lodash/find';
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { copyEvent, createEvent, createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

export const useInstrumentRecordingsOperations = () => {
    const { getSoundEventById, setOverlapGroups } = useContext(CollisionsContext);

    const updateGroups = (setOverlapGroups, updateCallback) => {
        setOverlapGroups((prevGroups) => {
            const updatedGroups = { ...prevGroups };
            updateCallback(updatedGroups);

            return updatedGroups;
        });
    };

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
            const { id: eventId } = event;

            const soundEvent = getSoundEventById(eventId);

            if (soundEvent && soundEvent.element) {
                const recordingData = { ...soundEvent.element.attrs['data-recording'] };

                if (recordingData && recordingData.params) {
                    // Find and update the specific param using Lodash
                    const paramToUpdate = find(recordingData.params, { name: updatedParam.name });
                    if (paramToUpdate) {
                        Object.assign(paramToUpdate, updatedParam); // Update with new values
                    }

                    // Re-assign the updated data-recording back to the element's attributes
                    soundEvent.element.setAttr('data-recording', recordingData);

                    // Trigger a redraw by Konva
                    soundEvent.element.draw();
                }
            }
        },
        [getSoundEventById]
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
                const baseStartTime = eventsToDuplicate[0]?.startTime || 0;
                const startOffset = newStartTime !== null ? newStartTime - baseStartTime : 0;

                eventsToDuplicate.forEach((event) => {
                    const targetInstrumentName = event.targetInstrumentName;

                    if (!updatedGroups[targetInstrumentName]) {
                        updatedGroups[targetInstrumentName] = {};
                    }

                    const duplicatedEvent = copyEvent(event, targetInstrumentName, startOffset);

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

    const getElementParentOverlapGroup = useCallback((el) => {
        const overlapGroup = el.attrs['data-group-child']?.current?.attrs['data-overlap-group'];

        return overlapGroup;
    }, []);

    return {
        addRecording: recordSoundEvent,
        deleteAllRecordingsForInstrument,
        deleteOverlapGroup,
        duplicateEventsToInstrument,
        duplicateInstrument,
        getElementParentOverlapGroup,
        lockOverlapGroup,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
