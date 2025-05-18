import Konva from 'konva';
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';

const PixelRatioContext = createContext(1);

/** Hook for any component to read the current px→sec ratio */
export function usePixelRatio() {
    return useContext(PixelRatioContext);
}

/**
 * Wraps its children in a <div> that fills 100% width,
 * observes its size, and provides device-px/sec via context.
 *
 * @param {object} props
 * @param {number} props.durationSec — total timeline length, in seconds
 * @param {React.ReactNode} props.children
 */
export function PixelRatioProvider({ children, durationSec }) {
    const wrapperRef = useRef(null);
    const [width, setWidth] = useState(() => wrapperRef.current?.offsetWidth || window.innerWidth);

    useLayoutEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        // initial measurement
        setWidth(el.offsetWidth);

        const ro = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // CSS-px per second
    const cssPxPerSec = useMemo(() => width / durationSec, [width, durationSec]);

    // devicePixelRatio (1 on non-retina, 2 on retina, etc.)
    const dpr = typeof window !== 'undefined' ? Konva.pixelRatio : 1;

    // multiply once to get device-px per second
    const devicePxPerSec = useMemo(() => cssPxPerSec * dpr, [cssPxPerSec, dpr]);

    return (
        <PixelRatioContext.Provider value={devicePxPerSec}>
            <div ref={wrapperRef} style={{ width: '100%' }}>
                {children}
            </div>
        </PixelRatioContext.Provider>
    );
}
