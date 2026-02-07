
import React from 'react';
import SVGCanvas from './SVGCanvas';
import Connector from './Connector';
import Box from './Box';

const CenterPanel = ({
    layout,
    zoom,
    panOffset,
    isPanning,
    dragState,
    data,
    svgRef,
    isPortrait,
    canvasWidth,
    canvasHeight,
    legends,
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleDragStart,
    resetZoom,
    setZoom, // New Prop
    theme,
    selectedNodeId // New Prop
}) => {
    return (
        <div className="flex-1 h-full flex flex-col p-12 overflow-y-auto relative bg-[#F1F5F9] scrollbar-hide">
            <div className="max-w-7xl w-full mx-auto pb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Live Vector Preview</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">VIRTUAL<br />CANVAS</h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="px-4 py-1.5 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                            {canvasWidth} x {canvasHeight} Native
                        </div>
                    </div>
                </div>

                <div className="relative group flex justify-center bg-slate-200/50 rounded-[2rem] p-8 overflow-hidden"
                    onWheel={handleWheel}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    style={{ cursor: isPanning ? 'grabbing' : 'auto' }}>

                    {/* The Canvas Case */}
                    <div className="bg-white rounded-[1rem] shadow-[0_60px_100px_-30px_rgba(0,0,0,0.2)] border-4 border-white p-1 transition-all duration-700 hover:shadow-[0_80px_120px_-30px_rgba(37,99,235,0.2)]">
                        <div className="overflow-hidden bg-white border border-slate-100 shadow-inner" style={{ width: isPortrait ? '700px' : '960px', aspectRatio: `${canvasWidth}/${canvasHeight}` }}>
                            <SVGCanvas width={canvasWidth} height={canvasHeight} ref={svgRef} background={theme.canvasBg}>
                                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`} style={{ transformOrigin: 'center' }}>
                                    {/* Render Group Backgrounds First */}
                                    {(layout.groups || []).map(g => (
                                        <g key={g.id}
                                            onMouseDown={(e) => handleDragStart(e, 'group', g.label)}
                                            className="cursor-move group-hover:opacity-100 transition-opacity">
                                            <rect
                                                x={g.x}
                                                y={g.y}
                                                width={g.w}
                                                height={g.h}
                                                fill={g.color}
                                                fillOpacity="0.06"
                                                stroke={g.color}
                                                strokeWidth="3"
                                                strokeDasharray="12,6"
                                                rx="32"
                                                className="hover:fill-opacity-1 props-all"
                                            />
                                            <text
                                                x={g.x + 15}
                                                y={g.y - 12}
                                                fontSize="16"
                                                fontWeight="900"
                                                fill={g.color}
                                                style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
                                            >
                                                {g.label}
                                            </text>
                                        </g>
                                    ))}

                                    {layout.connectors.map((c, i) => (
                                        <Connector key={`c-${i}`} d={c.path} theme={theme} />
                                    ))}
                                    {(layout.nodes || []).map((n) => (
                                        <Box
                                            key={n.id}
                                            x={n.x}
                                            y={n.y}
                                            width={n.w}
                                            height={n.h}
                                            text={n.text}
                                            color={n.color}
                                            textColor={n.textColor}
                                            fontSize={n.fontSize}
                                            fontWeight={n.fontWeight}
                                            note={n.note}
                                            isRoot={data.some(r => r.id === n.id)}
                                            onMouseDown={(e) => handleDragStart(e, 'node', n.id)}
                                            theme={theme}
                                            isSelected={selectedNodeId === n.id}
                                        />
                                    ))}
                                    {/* Render Legends on Canvas */}
                                    <g transform={`translate(50, ${canvasHeight - (legends.length * 40 + 60)})`}>
                                        {legends.map((reg, idx) => (
                                            <g key={idx} transform={`translate(0, ${idx * 40})`}>
                                                <rect width="24" height="24" fill={reg.color} rx="6" />
                                                <text x="36" y="17" fontSize="16" fontWeight="bold" fill="#334155">{reg.label}</text>
                                            </g>
                                        ))}
                                    </g>
                                </g>
                            </SVGCanvas>
                        </div>
                    </div>

                    {/* Aesthetics Background */}
                    <div className="absolute -top-10 -left-10 w-60 h-60 bg-blue-600/5 blur-[80px] rounded-full -z-10"></div>
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-indigo-600/5 blur-[80px] rounded-full -z-10"></div>
                </div>

                {/* Zoom Controls (Bottom Center) */}
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4 z-50">
                    <button onClick={resetZoom} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px]">
                        R
                    </button>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-32 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="w-px h-4 bg-slate-300"></div>
                    <span className="text-[10px] font-black text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

export default CenterPanel;
