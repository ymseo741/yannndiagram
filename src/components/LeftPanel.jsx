
import React, { useState } from 'react';
import { parseIndentedText } from '../utils/textParser';

const PRESET_COLORS = ["#F8FAFC", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#334155"];

const LeftPanel = ({
    data,
    updateNode,
    addNode,
    deleteNode,
    addRoot,
    savedFiles,
    saveName,
    setSaveName,
    handleSaveLayout,
    handleLoadLayout,
    handleDeleteSave,
    activeTab,
    setActiveTab,
    jsonInput,
    handleJsonChange,
    getAllPotentialParents
}) => {
    const [importText, setImportText] = useState("");

    const handleImport = () => {
        if (!importText.trim()) return;
        try {
            const parsedData = parseIndentedText(importText);
            if (parsedData.length > 0) {
                // We use handleJsonChange to update the data in App.jsx
                handleJsonChange(JSON.stringify(parsedData, null, 2));
                setImportText("");
                setActiveTab('gui');
            }
        } catch (e) {
            console.error("Import failed", e);
            alert("텍스트 파싱에 실패했습니다.");
        }
    };

    const renderGuiEditor = (node, depth = 0, isRootOfSystem = false) => {
        if (!node) return null;
        const safeText = (node.text || "").replace(/\\n/g, "\n");
        const currentFontSize = node.fontSize || 20;
        const isBold = node.fontWeight === "bold";

        return (
            <div key={node.id} className="mb-2 p-2 rounded-lg border border-slate-100 bg-white shadow-sm" style={{ marginLeft: `${depth * 10}px` }}>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-1.5">
                        <div className="flex-1 flex flex-col gap-1">
                            <textarea
                                rows="1"
                                className="w-full bg-slate-50 border border-slate-50 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold resize-none"
                                value={safeText}
                                placeholder="내용 입력..."
                                onChange={(e) => updateNode(node.id, { text: e.target.value.replace(/\n/g, "\\n") })}
                            />
                            <div className="flex gap-1.5">
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-50 border-none rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-400 focus:text-blue-600 outline-none"
                                    placeholder="Shared Group Label..."
                                    value={node.groupLabel || ""}
                                    onChange={(e) => updateNode(node.id, { groupLabel: e.target.value })}
                                />
                                <input
                                    type="color"
                                    className="w-4 h-4 rounded border-none bg-transparent cursor-pointer"
                                    value={node.groupColor || "#CBD5E1"}
                                    onChange={(e) => updateNode(node.id, { groupColor: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-0.5">
                            <button
                                type="button"
                                onClick={() => addNode(node.id)}
                                className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all bg-white rounded border border-slate-50 shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
                            </button>
                            {!(isRootOfSystem && data.length === 1) && (
                                <button
                                    type="button"
                                    onClick={() => deleteNode(node.id)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all bg-white rounded border border-slate-50 shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                        {/* Font Size Stepper */}
                        <div className="flex items-center bg-slate-100 rounded p-0.5">
                            <button
                                type="button"
                                onClick={() => updateNode(node.id, { fontSize: Math.max(12, currentFontSize - 2) })}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-[10px] font-bold"
                            >-</button>
                            <span className="w-6 text-center text-[9px] font-black text-slate-600">{currentFontSize}</span>
                            <button
                                type="button"
                                onClick={() => updateNode(node.id, { fontSize: Math.min(48, currentFontSize + 2) })}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-[10px] font-bold"
                            >+</button>
                        </div>

                        {/* Bold Toggle */}
                        <button
                            type="button"
                            onClick={() => updateNode(node.id, { fontWeight: isBold ? "normal" : "bold" })}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[9px] transition-all ${isBold ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            B
                        </button>

                    </div>


                    {/* Compact Color Palettes (Text & Bg) */}
                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400 w-3">Txt</span>
                            <div className="flex gap-1 flex-wrap max-w-[80px]">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        type="button"
                                        key={`text-${c}`}
                                        onClick={() => updateNode(node.id, { textColor: c })}
                                        className={`w-3 h-3 rounded-full border transition-all ${node.textColor === c ? 'border-slate-800 ring-1 ring-slate-200' : 'border-slate-100 hover:scale-125'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400 w-3">Box</span>
                            <div className="flex gap-1 flex-wrap max-w-[80px]">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        type="button"
                                        key={`bg-${c}`}
                                        onClick={() => updateNode(node.id, { color: c })}
                                        className={`w-3 h-3 rounded-full border transition-all ${node.color === c ? 'border-slate-800 ring-1 ring-slate-200' : 'border-slate-100 hover:scale-125'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {node.children && node.children.map(child => renderGuiEditor(child, depth + 1, false))}
            </div>
        );
    };

    return (
        <div className="w-[420px] h-full border-r bg-white flex flex-col shadow-2xl z-30">
            <div className="p-6 border-b bg-white relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl shadow-slate-200">D</div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">PRO ENGINE</h1>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">v9.0 Modular</span>
                    </div>
                </div>

                {/* Scenario Manager */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scenario Manager</div>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Scenario Name..."
                            className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleSaveLayout}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-3 rounded transition-colors"
                        >
                            SAVE
                        </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                        {Object.entries(savedFiles).length === 0 && <div className="text-[9px] text-slate-400 italic text-center py-2">No saved scenarios</div>}
                        {Object.entries(savedFiles).map(([name, file]) => (
                            <div key={name} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded hover:border-blue-200 group transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-700">{name}</span>
                                    <span className="text-[8px] text-slate-400">{new Date(file.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={(e) => handleLoadLayout(name, e)} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold hover:bg-blue-100">LOAD</button>
                                    <button type="button" onClick={(e) => handleDeleteSave(name, e)} className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-bold hover:bg-red-100">DEL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Header */}
            <div className="flex border-b text-[11px] font-black text-slate-400 bg-white uppercase tracking-widest sticky top-0 z-20">
                <button
                    onClick={() => setActiveTab('gui')}
                    className={`flex-1 py-4 transition-all outline-none ${activeTab === 'gui' ? 'text-blue-600 border-b-4 border-blue-600' : 'hover:text-slate-800'}`}
                >
                    Structure
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-4 transition-all outline-none ${activeTab === 'import' ? 'text-blue-600 border-b-4 border-blue-600' : 'hover:text-slate-800'}`}
                >
                    Import
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    className={`flex-1 py-4 transition-all outline-none ${activeTab === 'json' ? 'text-blue-600 border-b-4 border-blue-600' : 'hover:text-slate-800'}`}
                >
                    JSON
                </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-slate-50/50">
                {activeTab === 'gui' ? (
                    <div className="space-y-4">
                        {data.map(root => renderGuiEditor(root, 0, true))}
                        <button
                            onClick={addRoot}
                            className="w-full py-6 border-4 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 mt-4 group shadow-sm active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            신규 독립 루트 추가
                        </button>
                    </div>
                ) : activeTab === 'json' ? (
                    <textarea
                        className="w-full h-full p-8 font-mono text-[11px] leading-relaxed border-none rounded-3xl focus:ring-0 outline-none resize-none bg-slate-900 text-slate-400"
                        value={jsonInput}
                        onChange={(e) => handleJsonChange(e.target.value)}
                    />
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
                            <h3 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-2">Bulk Text Import</h3>
                            <p className="text-[10px] text-blue-600 leading-relaxed mb-0">
                                Paste your indented text below. Tabs or 2-spaces will create hierarchy.
                            </p>
                        </div>
                        <textarea
                            className="flex-1 p-4 font-mono text-[11px] leading-relaxed border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white text-slate-700 mb-4"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder={`Root Node\n  Child 1\n    Grandchild A\n  Child 2`}
                        />
                        <button
                            onClick={handleImport}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            CONVERT TO DIAGRAM
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
