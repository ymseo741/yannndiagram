
import React, { forwardRef } from 'react';

const SVGCanvas = forwardRef(({ children, width = 1920, height = 1080, background = '#ffffff' }, ref) => {
    return (
        <svg
            ref={ref}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            style={{
                width: '100%',
                height: 'auto',
                backgroundColor: background,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width={width} height={height} fill={background} />
            {children}
        </svg>
    );
});

export default SVGCanvas;
