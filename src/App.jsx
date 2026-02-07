
import React, { useState, useRef, useEffect } from 'react';
import { layoutHierarchy } from './engine';
import Modal from './components/Modal';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import { THEMES } from './themes';
import { exportToPptx } from './utils/pptxExporter';
import { useKeyboardGlobal } from './hooks/useKeyboardGlobal';
import { saveAs } from 'file-saver';

const DEFAULT_COLOR = "#F8FAFC";
const ROOT_COLOR = "#2563EB";

const INITIAL_DATA = [
  {
    id: "root",
    text: "메인 시스템\\n아키텍처",
    color: ROOT_COLOR,
    textColor: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    children: [
      {
        id: "c1",
        text: "데이터 계층",
        color: "#DBEAFE",
        textColor: "#1E293B",
        fontSize: 20,
        fontWeight: "500",
        children: [
          { id: "g1", text: "센서 커넥터", color: DEFAULT_COLOR, fontSize: 18 },
          { id: "g2", text: "레거시 DB", color: DEFAULT_COLOR, fontSize: 18 }
        ]
      },
      {
        id: "c2",
        text: "서비스 계층",
        color: "#DCFCE7",
        textColor: "#1E293B",
        fontSize: 20,
        fontWeight: "500",
        children: [
          { id: "g3", text: "API 서버", color: DEFAULT_COLOR, fontSize: 18 },
          { id: "g4", text: "인증 모듈", color: DEFAULT_COLOR, fontSize: 18 }
        ]
      }
    ]
  }
];

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ppt_diagram_data_v8');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' | 'horizontal'
  const [isPortrait, setIsPortrait] = useState(false); // boolean for canvas orientation
  const [connectorLength, setConnectorLength] = useState(300); // Level spacing
  const [siblingSpacing, setSiblingSpacing] = useState(100); // Node spacing (siblings)

  const [currentTheme, setCurrentTheme] = useState(THEMES.default);

  const [zoom, setZoom] = useState(0.4); // Zoom level
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Pan offset
  const [isPanning, setIsPanning] = useState(false);
  const [legends, setLegends] = useState([]); // Array of { color: "#...", label: "..." }

  const [layout, setLayout] = useState({ nodes: [], connectors: [], groups: [] });

  // History System
  const [history, setHistory] = useState([JSON.stringify(INITIAL_DATA)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dragging System
  const [dragState, setDragState] = useState({
    activeId: null,      // node ID or group Label
    type: null,          // 'node' or 'group'
    startX: 0,
    startY: 0,
    initialOffsets: {}   // { id: {x, y} }
  });

  // Selection System for Keyboard Actions
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Save System
  const [saveName, setSaveName] = useState("");
  const [savedFiles, setSavedFiles] = useState(() => {
    const saved = localStorage.getItem('ppt_diagram_saves');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState('gui');
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const showConfirm = (title, message, onConfirm, type = 'confirm') => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        onConfirm();
        closeModal();
      }
    });
  };

  const showAlert = (title, message) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: closeModal
    });
  };

  useEffect(() => {
    localStorage.setItem('ppt_diagram_data_v8', JSON.stringify(data));
    setJsonInput(JSON.stringify(data, null, 2));
  }, [data]);

  useEffect(() => {
    try {
      const res = layoutHierarchy(data, orientation, {
        levelStep: connectorLength,
        siblingSpacing: siblingSpacing,
        connectorStyle: currentTheme.connectorStyle // Pass style to layout if needed (mostly for rendering)
      });
      setLayout(res);
      setError(null);
    } catch (err) {
      setError("레이아웃 계산 중 오류가 발생했습니다.");
    }
  }, [data, orientation, connectorLength, siblingSpacing, currentTheme]);

  // History Actions
  const pushToHistory = (newData) => {
    const jsonStr = JSON.stringify(newData);
    if (jsonStr === history[historyIndex]) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(jsonStr);
    if (newHistory.length > 30) newHistory.shift(); // Limit history size

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setData(JSON.parse(history[prevIdx]));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setData(JSON.parse(history[nextIdx]));
    }
  };

  // Keyboard Shortcuts
  useKeyboardGlobal({
    deleteNode: () => {
      if (selectedNodeId) {
        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }
    },
    addChild: () => {
      if (selectedNodeId) {
        addNode(selectedNodeId);
      }
    },
    undo: undo,
    redo: redo
  }, [selectedNodeId, historyIndex, history]);

  // Save/Load Actions
  const handleSaveLayout = (e) => {
    if (e) e.preventDefault();

    if (!saveName.trim()) {
      showAlert("입력 오류", "저장할 이름을 입력해주세요.");
      return;
    }
    const saveObject = {
      data,
      config: {
        orientation,
        connectorLength,
        siblingSpacing,
        legends,
        isPortrait,
        zoom,
        panOffset // Save view state
      },
      timestamp: Date.now()
    };
    const newSaves = { ...savedFiles, [saveName]: saveObject };
    setSavedFiles(newSaves);
    localStorage.setItem('ppt_diagram_saves', JSON.stringify(newSaves));
    setSaveName("");
    showAlert("저장 완료", `'${saveName}' 저장이 완료되었습니다.`);
  };

  const handleLoadLayout = (name, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    showConfirm(
      "불러오기 확인",
      `'${name}' 불러오시겠습니까?\n현재 작업 내용은 덮어씌워집니다.`,
      () => {
        const loaded = savedFiles[name];
        if (loaded) {
          // Force a fresh object reference to trigger re-renders
          const newData = JSON.parse(JSON.stringify(loaded.data));
          setData(newData);

          // Load Config if exists (backward compatibility)
          if (loaded.config) {
            setOrientation(loaded.config.orientation || 'vertical');
            setConnectorLength(loaded.config.connectorLength || 200);
            setSiblingSpacing(loaded.config.siblingSpacing || 50);
            setLegends(loaded.config.legends || []);
            setIsPortrait(loaded.config.isPortrait !== undefined ? loaded.config.isPortrait : true);
            if (loaded.config.zoom) setZoom(loaded.config.zoom);
            if (loaded.config.panOffset) setPanOffset(loaded.config.panOffset);
          }

          pushToHistory(newData);
          showAlert("불러오기 완료", `'${name}' 불러오기가 완료되었습니다.`);
        }
      }
    );
  };

  const handleDeleteSave = (name, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    showConfirm(
      "삭제 확인",
      `'${name}' 정말 삭제하시겠습니까?`,
      () => {
        const newSaves = { ...savedFiles };
        delete newSaves[name];
        setSavedFiles(newSaves);
        localStorage.setItem('ppt_diagram_saves', JSON.stringify(newSaves));
      },
      'danger'
    );
  };

  const updateNode = (id, fields) => {
    if (!Array.isArray(data)) return;
    const newData = JSON.parse(JSON.stringify(data));
    const findAndReplace = (nodes) => {
      if (!Array.isArray(nodes)) return false;
      for (let node of nodes) {
        if (node.id === id) {
          Object.assign(node, fields);
          return true;
        }
        if (node.children && findAndReplace(node.children)) return true;
      }
      return false;
    };
    if (findAndReplace(newData)) {
      setData(newData);
      pushToHistory(newData);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.altKey) {
      const delta = e.deltaY > 0 ? 0.98 : 1.02; // Smoother zoom
      setZoom(z => Math.min(5, Math.max(0.1, z * delta)));
    } else {
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleDragStart = (e, type, activeId) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left-click for drag

    const initialOffsets = {};
    if (type === 'group') {
      layout.nodes.filter(n => n.groupLabel === activeId).forEach(n => {
        initialOffsets[n.id] = { x: n.offsetX || 0, y: n.offsetY || 0 };
      });
      setSelectedNodeId(null); // Clear node selection when dragging group
    } else {
      const node = layout.nodes.find(n => n.id === activeId);
      if (node) initialOffsets[node.id] = { x: node.offsetX || 0, y: node.offsetY || 0 };
      setSelectedNodeId(activeId); // Select the node
    }

    setDragState({
      activeId,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialOffsets
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    } else {
      // Clicking on empty canvas clears selection
      // But we need to make sure we didn't click a node. 
      // handleDragStart fires on node mousedown. This fires on canvas mousedown.
      // If bubbling is stopped in handleDragStart, this won't fire for nodes.
      setSelectedNodeId(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
      return;
    }

    if (dragState.activeId) {
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;

      const newData = JSON.parse(JSON.stringify(data));
      const applyOffset = (nodes) => {
        nodes.forEach(n => {
          if (dragState.initialOffsets[n.id]) {
            n.offsetX = dragState.initialOffsets[n.id].x + dx;
            n.offsetY = dragState.initialOffsets[n.id].y + dy;
          }
          if (n.children) applyOffset(n.children);
        });
      };
      applyOffset(newData);
      setData(newData);
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragState.activeId) {
      pushToHistory(data);
    }
    setIsPanning(false);
    // Do NOT clear selectedNodeId here, to keep selection active for keyboard
    setDragState({ activeId: null, type: null, startX: 0, startY: 0, initialOffsets: {} });
  };
  const resetZoom = () => {
    setZoom(isPortrait ? 0.35 : 0.45);
    setPanOffset({ x: 0, y: 0 });
  };

  const addNode = (parentId) => {
    if (!Array.isArray(data)) return;
    const newData = JSON.parse(JSON.stringify(data));
    const newNode = { id: `n-${Date.now()}`, text: "새 노드", color: DEFAULT_COLOR, fontSize: 20 };
    const findAndAdd = (nodes) => {
      if (!Array.isArray(nodes)) return false;
      for (let node of nodes) {
        if (node.id === parentId) {
          if (!node.children) node.children = [];
          node.children.push(newNode);
          return true;
        }
        if (node.children && findAndAdd(node.children)) return true;
      }
      return false;
    };
    if (findAndAdd(newData)) {
      setData(newData);
      pushToHistory(newData);
    }
  };

  const addRoot = () => {
    if (!Array.isArray(data)) return;
    const newRoot = { id: `root-${Date.now()}`, text: "새 루트", color: ROOT_COLOR, fontSize: 24, fontWeight: "bold", children: [] };
    const newData = [...data, newRoot];
    setData(newData);
    pushToHistory(newData);
  };

  const deleteNode = (id) => {
    if (!Array.isArray(data)) return;
    let newData = JSON.parse(JSON.stringify(data));
    const findAndDelete = (nodes) => {
      if (!Array.isArray(nodes)) return false;
      const index = nodes.findIndex(n => n.id === id);
      if (index > -1) {
        nodes.splice(index, 1);
        return true;
      }
      for (let node of nodes) {
        if (node.children && findAndDelete(node.children)) return true;
      }
      return false;
    };
    if (findAndDelete(newData)) {
      setData(newData);
      pushToHistory(newData);
    }
  };

  const getAllPotentialParents = (excludeId) => {
    if (!Array.isArray(data)) return [];
    const list = [];
    const traverse = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach(n => {
        if (n.id !== excludeId) {
          const safeText = (n.text || "").replace(/\\\\n/g, " ").replace(/\\n/g, " ");
          list.push({ id: n.id, text: safeText });
          if (n.children) traverse(n.children);
        }
      });
    };
    traverse(data);
    return list;
  };

  const handleJsonChange = (val) => {
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      setData(parsed);
      pushToHistory(parsed);
      setError(null);
    } catch (err) {
      setError("올바른 JSON 형식이 아닙니다.");
    }
  };

  const handleExport = () => {
    if (!svgRef.current) return;
    const svgData = svgRef.current.outerHTML;
    // Use File constructor to embed filename
    const fileName = `Diagram_Vector_${new Date().getTime()}.svg`;
    const svgFile = new File([svgData], fileName, { type: "image/svg+xml;charset=utf-8" });
    saveAs(svgFile);
    // Removed manual link creation which fails on some browsers
  };

  const handlePngExport = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");

    const canvasWidth = isPortrait ? 1400 : 1920;
    const canvasHeight = isPortrait ? 2000 : 1080;

    // Scale for high resolution
    const scale = 2.5;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvasWidth * scale, canvasHeight * scale);
      const pngUrl = canvas.toDataURL("image/png");

      // Convert DataURL to Blob for saveAs
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `Diagram_Image_${new Date().getTime()}.png`;
          const file = new File([blob], fileName, { type: "image/png" });
          saveAs(file);
        }
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handlePptxExport = () => {
    try {
      exportToPptx(layout, currentTheme, isPortrait, data);
      showAlert("PPTX 내보내기", "PowerPoint 파일 생성을 시작했습니다.");
    } catch (e) {
      console.error(e);
      showAlert("오류", "PPTX 변환 중 문제가 발생했습니다.");
    }
  };

  const canvasWidth = isPortrait ? 1400 : 1920;
  const canvasHeight = isPortrait ? 2000 : 1080;

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      <LeftPanel
        data={data}
        updateNode={updateNode}
        addNode={addNode}
        deleteNode={deleteNode}
        addRoot={addRoot}
        savedFiles={savedFiles}
        saveName={saveName}
        setSaveName={setSaveName}
        handleSaveLayout={handleSaveLayout}
        handleLoadLayout={handleLoadLayout}
        handleDeleteSave={handleDeleteSave}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jsonInput={jsonInput}
        handleJsonChange={handleJsonChange}
        getAllPotentialParents={getAllPotentialParents}
      />

      <CenterPanel
        layout={layout}
        zoom={zoom}
        panOffset={panOffset}
        isPanning={isPanning}
        dragState={dragState}
        data={data}
        svgRef={svgRef}
        isPortrait={isPortrait}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        legends={legends}
        handleWheel={handleWheel}
        handleCanvasMouseDown={handleCanvasMouseDown}
        handleCanvasMouseMove={handleCanvasMouseMove}
        handleCanvasMouseUp={handleCanvasMouseUp}
        handleDragStart={handleDragStart}
        resetZoom={resetZoom}
        setZoom={setZoom}
        theme={currentTheme}
        selectedNodeId={selectedNodeId}
      />

      <RightPanel
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        history={history}
        orientation={orientation}
        setOrientation={setOrientation}
        isPortrait={isPortrait}
        setIsPortrait={setIsPortrait}
        connectorLength={connectorLength}
        setConnectorLength={setConnectorLength}
        siblingSpacing={siblingSpacing}
        setSiblingSpacing={setSiblingSpacing}
        legends={legends}
        setLegends={setLegends}
        handleExport={handleExport}
        handlePngExport={handlePngExport}
        handlePptxExport={handlePptxExport}
        showConfirm={showConfirm}
        setData={setData}
        INITIAL_DATA={INITIAL_DATA}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        THEMES={THEMES}
      />

      {/* Global Modal */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        type={modal.type}
      />
    </div>
  );
}

export default App;
