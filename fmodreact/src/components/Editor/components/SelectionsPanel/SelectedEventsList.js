import React from 'react';
import { EventItem } from '../Panel/EventItem';

export const SelectedEventsList = ({ onClose, onDeleteRecording, onPlayEvent, selectedValues }) => {
    return (
        <>
            {selectedValues.map((event) => {
                function onDelete() {
                    onDeleteRecording(event);
                }

                function onPlay() {
                    onPlayEvent(event.eventInstance);
                }

                return <EventItem key={event.id} event={event} onDelete={onDelete} onPlay={onPlay} onClose={onClose} />;
            })}
        </>
    );
};

export default React.memo(SelectedEventsList);
