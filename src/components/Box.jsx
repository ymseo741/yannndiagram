
import React from 'react';

const Box = ({
    x, y, width, height, text,
    color = "#F8FAFC",
    textColor = "#1E293B",
    fontSize = 20,
    fontWeight = "500",
    isRoot = false,
    note = "",
    onMouseDown,
    theme,
    isSelected // New Prop
}) => {
    // Detect if colors are defaults, to allow theme override
    const isDefaultBg = color === "#F8FAFC" || color === "#ffffff";
    const mainColor = isDefaultBg ? (theme?.nodeBg || color) : color;

    const isDefaultText = textColor === "#1E293B";

    // Root text color logic: 
    // If root, default should be White (or Dark in dark mode). 
    // BUT if user manually changed text color (it's not default #1E293B), we should respect it.
    const rootDefaultColor = theme?.id === 'dark' ? '#0F172A' : '#FFFFFF';

    const effectiveTextColor = isRoot
        ? (isDefaultText ? rootDefaultColor : textColor)
        : (isDefaultText ? (theme?.text || textColor) : textColor);

    // Root color handling
    const isDefaultRootColor = color === "#2563EB" || color === "#ffffff" || color === "#F8FAFC"; // Also check for default blue or white
    const rootBg = theme?.rootColor || "#2563EB";

    // If it's root, use theme root color UNLESS user manually set a different color
    // If user color is one of the defaults, we assume they haven't manually changed it yet
    // OR we assume they want the theme to control it. 
    // Actually, a better check: if color matches the DEFAULT_COLOR or ROOT_COLOR constant from App.jsx?
    // Let's stick to the logic: if color is default blue, use theme root color. If changed, use that color.
    const finalFill = isRoot
        ? (isDefaultRootColor ? rootBg : color)
        : mainColor;

    const strokeColor = isRoot
        ? (theme?.highlight || "#1D4ED8")
        : (theme?.nodeBorder || "#CBD5E1");

    const shadowColor = theme?.id === 'dark' || theme?.id === 'blueprint' ? 'transparent' : "#E2E8F0";

    const safeText = text || "";
    const lines = safeText.split('\\n');
    const lineHeight = fontSize === undefined ? 20 * 1.4 : fontSize * 1.4;

    const totalTextHeight = lines.length * (fontSize === undefined ? 20 * 1.2 : fontSize * 1.2);
    const startTextY = y + (height / 2) - (totalTextHeight / 2) + (fontSize === undefined ? 20 * 0.8 : fontSize * 0.8);

    const fontFamily = theme?.font === 'monospace' ? '"Courier New", Courier, monospace' : '"Noto Sans KR", sans-serif';

    return (
        <g onMouseDown={onMouseDown}>
            {note && (
                <text
                    x={x + 2}
                    y={y - 8}
                    fontSize="10"
                    fontWeight="800"
                    fill={theme?.highlight || "#6366F1"}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily }}
                >
                    {note}
                </text>
            )}

            {/* Shadow (only if defined) */}
            {shadowColor !== 'transparent' && (
                <rect
                    x={x + 4} y={y + 4} width={width} height={height}
                    fill={shadowColor} rx="12" ry="12"
                />
            )}

            {/* Main Box */}
            <rect
                x={x} y={y} width={width} height={height}
                fill={finalFill}
                stroke={strokeColor}
                strokeWidth={isRoot ? "3" : "2"}
                rx="12" ry="12"
                fillOpacity={theme?.id === 'blueprint' && !isRoot ? 0 : 1}
            />

            {/* Selection Ring */}
            {isSelected && (
                <rect
                    x={x - 4} y={y - 4} width={width + 8} height={height + 8}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    rx="16" ry="16"
                    className="animate-pulse"
                />
            )}

            <text
                x={x + width / 2}
                y={startTextY}
                fill={effectiveTextColor}
                fontSize={fontSize}
                fontWeight={isRoot ? "bold" : fontWeight}
                fontFamily={fontFamily}
                textAnchor="middle"
            >
                {lines.map((line, i) => (
                    <tspan key={i} x={x + width / 2} dy={i === 0 ? 0 : lineHeight}>{line}</tspan>
                ))}
            </text>
        </g>
    );
};

export default Box;
