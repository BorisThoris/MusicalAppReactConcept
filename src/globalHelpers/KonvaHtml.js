import { useContextBridge } from 'its-fine';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Group } from 'react-konva';

const needForceStyle = (el) => {
    const pos = window.getComputedStyle(el).position;
    return !(pos === 'absolute' || pos === 'relative');
};

export function useEvent(fn = () => {}) {
    const ref = React.useRef(fn);
    ref.current = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback((...args) => ref.current.apply(null, args), []);
}

/**
 * KonvaHtml
 * Props:
 *  - divProps: DOM props for the overlay div (style merged, not replaced)
 *  - groupProps: props passed to the anchor <Group/>
 *  - transform: boolean (default true) – follow Konva transform
 *  - transformFunc: (attrs) => attrs – override transform attrs
 *  - interactive: boolean (default false) – allow DOM to receive pointer events
 *  - zIndex: number|string (default 10) – CSS stacking of the overlay
 */
export const KonvaHtml = ({
    children,
    divProps,
    groupProps,
    interactive = false,
    transform,
    transformFunc,
    zIndex = 10
}) => {
    const Bridge = useContextBridge();
    const groupRef = React.useRef(null);
    const container = React.useRef();

    const [div] = React.useState(() => document.createElement('div'));
    const root = React.useMemo(() => ReactDOM.createRoot(div), [div]);

    const shouldTransform = transform ?? true;

    const handleTransform = useEvent(() => {
        const group = groupRef.current;
        if (!group) return;

        // Mirror visibility
        const visible = group.isVisible();
        div.style.display = visible ? '' : 'none';

        if (shouldTransform) {
            const tr = group.getAbsoluteTransform();
            let attrs = tr.decompose();
            if (transformFunc) attrs = transformFunc(attrs);

            div.style.position = 'absolute';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.zIndex = String(zIndex);
            div.style.pointerEvents = interactive ? 'auto' : 'none'; // ✅ key fix
            div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
            div.style.transformOrigin = 'top left';
        } else {
            div.style.position = '';
            div.style.top = '';
            div.style.left = '';
            div.style.transform = '';
            div.style.transformOrigin = '';
            div.style.zIndex = String(zIndex);
            div.style.pointerEvents = interactive ? 'auto' : 'none';
        }

        // Merge user styles/props last
        const { style, ...restProps } = divProps || {};
        if (style) Object.assign(div.style, style);
        if (restProps) Object.assign(div, restProps);
    });

    React.useLayoutEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        const parent = group.getStage()?.container();
        if (!parent) return;

        parent.appendChild(div);
        if (shouldTransform && needForceStyle(parent)) {
            parent.style.position = 'relative';
        }

        // Primary + robust fallbacks
        const listeners = [
            'absoluteTransformChange',
            'transform',
            'dragmove',
            'xChange',
            'yChange',
            'scaleXChange',
            'scaleYChange',
            'rotationChange',
            'visibleChange'
        ];

        listeners.forEach((ev) => group.on(ev, handleTransform));
        handleTransform();

        return () => {
            listeners.forEach((ev) => group.off(ev, handleTransform));
            div.parentNode?.removeChild(div);
        };
    }, [div, handleTransform, shouldTransform]);

    React.useLayoutEffect(() => {
        handleTransform();
    }, [divProps, handleTransform, transformFunc, interactive, zIndex]);

    React.useLayoutEffect(() => {
        root.render(<Bridge>{children}</Bridge>);
    });

    React.useLayoutEffect(() => {
        return () => {
            setTimeout(() => root.unmount());
        };
    }, [root]);

    return <Group ref={groupRef} {...groupProps} />;
};
