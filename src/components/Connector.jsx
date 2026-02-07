
import React from 'react';

const Connector = ({ d, strokeColor = "#94A3B8", strokeWidthArr = "3", theme }) => {
    const finalColor = theme?.line || strokeColor;
    const isDashed = theme?.dashed ? "8,8" : undefined;

    return (
        <path
            d={d}
            fill="none"
            stroke={finalColor}
            strokeWidth={strokeWidthArr}
            strokeDasharray={isDashed}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

export default Connector;
