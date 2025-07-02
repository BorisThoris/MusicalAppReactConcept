import find from 'lodash/find';
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { copyEvent, createEvent, createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

export const useInstrumentRecordingsOperations = () => {
    const { getSoundEventById, setOverlapGroups } = useContext(CollisionsContext);

    const updateGroups = useCallback(
        (callback) => {
            setOverlapGroups((prevGroups) => callback(prevGroups));
        },
        [setOverlapGroups]
    );

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups((prevGroups) => ({
                ...prevGroups,
                [instrumentName]: {}
            }));
        },
        [updateGroups]
    );

    const deleteAllRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups((prevGroups) => {
                const { [instrumentName]: _, ...rest } = prevGroups;
                return rest;
            });
        },
        [updateGroups]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            const elapsedTime = getElapsedTime(startTime, startOffset);
            const eventPath = getEventPath(eventInstance);
            const effectiveStartTime = startOffset != null ? elapsedTime : startTime;

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: effectiveStartTime
            });

            const newGroup = {
                ...event,
                events: {
                    [event.id]: {
                        ...event,
                        parentId: event.id
                    }
                },
                locked: false
            };

            updateGroups((prevGroups) => {
                const groupsCopy = { ...prevGroups };
                if (!groupsCopy[instrumentName]) {
                    groupsCopy[instrumentName] = {};
                }
                groupsCopy[instrumentName] = {
                    ...groupsCopy[instrumentName],
                    [event.id]: newGroup
                };
                return groupsCopy;
            });
        },
        [updateGroups]
    );

    const duplicateEventsToInstrument = useCallback(
        ({ eventsToDuplicate, newStartTime = null }) => {
            updateGroups((prevGroups) => {
                const groupsCopy = { ...prevGroups };
                const baseStartTime = eventsToDuplicate[0]?.startTime ?? 0;
                const offset = newStartTime != null ? newStartTime - baseStartTime : 0;

                eventsToDuplicate.forEach(({ targetInstrumentName, ...event }) => {
                    const duplicated = copyEvent(event, targetInstrumentName, offset);
                    groupsCopy[targetInstrumentName] = {
                        ...groupsCopy[targetInstrumentName],
                        [duplicated.id]: duplicated
                    };
                });

                return groupsCopy;
            });
        },
        [updateGroups]
    );

    const duplicateInstrument = useCallback(
        (instrumentName) => {
            updateGroups((prevGroups) => {
                const groupsCopy = { ...prevGroups };
                const original = groupsCopy[instrumentName];
                if (!original) {
                    return prevGroups;
                }
                const newInstrumentName = `${instrumentName} Copy`;
                const newRecordings = Object.values(original).reduce((acc, recording) => {
                    const newEvent = createEvent({
                        instrumentName: newInstrumentName,
                        passedStartTime: recording.startTime,
                        recording
                    });
                    acc[newEvent.id] = newEvent;
                    return acc;
                }, {});
                return {
                    ...groupsCopy,
                    [newInstrumentName]: newRecordings
                };
            });
        },
        [updateGroups]
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

    const updateRecordingParams = useCallback(
        ({ event, updatedParam }) => {
            const soundEvent = getSoundEventById(event.id);
            const element = soundEvent?.element;
            if (!element) return;

            const recordingData = { ...element.attrs['data-recording'] };
            const params = recordingData.params ?? [];
            const target = find(params, ({ name }) => name === updatedParam.name);
            if (!target) return;

            Object.assign(target, updatedParam);
            element.setAttr('data-recording', recordingData);
            element.draw();
        },
        [getSoundEventById]
    );

    const getElementParentOverlapGroup = useCallback(
        (el) => el.attrs['data-group-child']?.current?.attrs['data-overlap-group'],
        []
    );

    return {
        addRecording: recordSoundEvent,
        deleteAllRecordingsForInstrument,
        duplicateEventsToInstrument,
        duplicateInstrument,
        getElementParentOverlapGroup,
        resetRecordings,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
