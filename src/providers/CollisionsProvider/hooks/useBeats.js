import { useEffect, useState } from 'react';

export const useBeats = () => {
    const [beats, setBeats] = useState([]);

    useEffect(() => {
        const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];
        setBeats(savedBeats);
    }, []);

    const saveBeatsToLocalStorage = (updatedBeats) => {
        localStorage.setItem('beats', JSON.stringify(updatedBeats));
        setBeats(updatedBeats);
    };

    return [beats, saveBeatsToLocalStorage];
};
