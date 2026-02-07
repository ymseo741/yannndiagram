
import React, { useRef } from 'react';

const RightPanel = ({
    undo,
    redo,
    historyIndex,
    history,
    orientation,
    setOrientation,
    isPortrait,
    setIsPortrait,
    connectorLength,
    setConnectorLength,
    siblingSpacing,
    setSiblingSpacing,
    legends,
    setLegends,
    handleExport,
    handlePngExport,
    handlePptxExport,
    showConfirm,
    setData,
    INITIAL_DATA,
    currentTheme,
    setCurrentTheme,
    THEMES,
    handleBackupExport,
    handleBackupImport
}) => {
    const fileInputRef = useRef(null);

    return (
        <div className="w-[300px] h-full border-l bg-white flex flex-col shadow-xl z-30 p-4 overflow-y-auto">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Global Settings</div>

            {/* Keyboard Shortcuts */}
            <details className="mb-4 group">
                <summary className="text-[9px] font-bold text-slate-400 uppercase cursor-pointer list-none flex items-center gap-1 hover:text-slate-600">
                    <span className="transition group-open:rotate-90">›</span> 키보드 단축키
                </summary>
                <ul className="mt-2 pl-3 space-y-1 text-[9px] text-slate-500 font-medium">
                    <li>노드 선택 후 <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Del</kbd> 삭제</li>
                    <li>노드 선택 후 <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Enter</kbd> 자식 추가</li>
                    <li><kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Ctrl+Z</kbd> 실행 취소</li>
                    <li><kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Ctrl+Shift+Z</kbd> 다시 실행</li>
                    <li><kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Ctrl+C</kbd> 노드 복사</li>
                    <li><kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Ctrl+V</kbd> 노드 붙여넣기</li>
                    <li><kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Ctrl+D</kbd> 노드 복제</li>
                    <li>캔버스 <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[8px]">Alt+휠</kbd> 줌</li>
                </ul>
            </details>

            {/* Theme Selector */}
            <div className="mb-6">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">Visual Theme</div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                    {Object.values(THEMES).map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => setCurrentTheme(theme)}
                            className={`py-2 text-[9px] font-bold rounded border transition-all ${currentTheme.id === theme.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-blue-300'}`}
                        >
                            {theme.name}
                        </button>
                    ))}
                </div>
                {/* Connector Style override */}
                <div className="flex bg-slate-100 rounded p-0.5">
                    {['curved', 'straight', 'orthogonal'].map(style => (
                        <button
                            key={style}
                            onClick={() => setCurrentTheme({ ...currentTheme, connectorStyle: style })}
                            className={`flex-1 py-1 text-[8px] font-bold rounded uppercase ${currentTheme.connectorStyle === style ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            {/* History Controls */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={undo}
                    disabled={historyIndex === 0}
                    title={historyIndex === 0 ? '실행 취소할 단계 없음' : `${historyIndex}단계 실행 취소`}
                    className={`flex-1 py-2 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${historyIndex === 0 ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    UNDO {historyIndex > 0 ? `(${historyIndex})` : ''}
                </button>
                <button
                    type="button"
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
                    title={historyIndex === history.length - 1 ? '다시 실행할 단계 없음' : `${history.length - 1 - historyIndex}단계 다시 실행`}
                    className={`flex-1 py-2 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${historyIndex === history.length - 1 ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                    REDO {historyIndex < history.length - 1 ? `(${history.length - 1 - historyIndex})` : ''}
                </button>
            </div>

            {/* Orientation */}
            <div className="space-y-2 mb-6">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Layout Direction</div>
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setOrientation('vertical')}
                        className={`flex-1 py-1.5 text-[9px] font-bold rounded ${orientation === 'vertical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        VERTICAL
                    </button>
                    <button
                        type="button"
                        onClick={() => setOrientation('horizontal')}
                        className={`flex-1 py-1.5 text-[9px] font-bold rounded ${orientation === 'horizontal' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        HORIZONTAL
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setIsPortrait(!isPortrait)}
                    className={`w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold rounded-lg border transition-all ${isPortrait ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    {isPortrait ? "Portrait Mode (A4)" : "Landscape Mode (HD)"}
                </button>
            </div>

            {/* Spacing Sliders */}
            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                        <span>Level Distance</span>
                        <span>{connectorLength}px</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        step="10"
                        value={connectorLength}
                        onChange={(e) => setConnectorLength(Number(e.target.value))}
                        aria-label="레벨 간격 (Level Distance)"
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                        <span>Node Gap</span>
                        <span>{siblingSpacing}px</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={siblingSpacing}
                        onChange={(e) => setSiblingSpacing(Number(e.target.value))}
                        aria-label="형제 노드 간격 (Node Gap)"
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>

            {/* Legend Manager */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Legends</div>
                    <button
                        type="button"
                        onClick={() => setLegends([...legends, { color: "#CBD5E1", label: "New Legend" }])}
                        className="text-[9px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                    >
                        + ADD
                    </button>
                </div>
                <div className="space-y-2">
                    {legends.map((legend, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={legend.color}
                                onChange={(e) => {
                                    const newLegends = [...legends];
                                    newLegends[idx].color = e.target.value;
                                    setLegends(newLegends);
                                }}
                                className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                            />
                            <input
                                type="text"
                                value={legend.label}
                                onChange={(e) => {
                                    const newLegends = [...legends];
                                    newLegends[idx].label = e.target.value;
                                    setLegends(newLegends);
                                }}
                                className="flex-1 bg-slate-50 border-none rounded px-2 py-1 text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newLegends = legends.filter((_, i) => i !== idx);
                                    setLegends(newLegends);
                                }}
                                className="text-slate-300 hover:text-red-500"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Backup (New) */}
            <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Backup</div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleBackupExport}
                        className="flex-1 py-2 bg-slate-800 text-white text-[9px] font-bold rounded hover:bg-slate-700"
                    >
                        EXPORT JSON
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-50"
                    >
                        IMPORT JSON
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleBackupImport(e.target.files[0]);
                                e.target.value = ''; // Reset
                            }
                        }}
                    />
                </div>
            </div>

            <div className="mt-auto space-y-2">
                <button type="button" onClick={handleExport} className="w-full py-2 bg-slate-800 text-white text-[10px] font-black rounded-lg">DOWNLOAD SVG</button>
                <div className="flex gap-2">
                    <button type="button" onClick={handlePngExport} className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg">PNG</button>
                    <button type="button" onClick={handlePptxExport} className="flex-1 py-2 bg-orange-600 text-white text-[10px] font-black rounded-lg">PPTX</button>
                </div>
                <button type="button" onClick={() => window.print()} className="w-full py-2 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">PRINT PDF</button>
                <button type="button" onClick={() => showConfirm("시스템 초기화", "모든 데이터가 초기화됩니다. 계속하시겠습니까?", () => setData(INITIAL_DATA), 'danger')} className="w-full py-2 text-slate-300 text-[9px] font-bold hover:text-red-400">RESET SYSTEM</button>
            </div>
        </div>
    );
};

export default RightPanel;
