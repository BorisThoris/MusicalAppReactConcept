import React, { useCallback, useState } from 'react';

const usePanelState = () => {
    const [panelState, setPanelState] = useState(null);

    const openPanel = (recording, index) => {
        console.log('sadec batec');
        setPanelState({ index, isOpen: true, recording });
    };

    const closePanel = useCallback(() => {
        setPanelState(null);
    }, []);

    return { closePanel, openPanel, panelState };
};

export default usePanelState;
