
export const THEMES = {
    default: {
        id: 'default',
        name: 'Modern Light',
        bg: '#F1F5F9', // slate-100
        canvasBg: '#FFFFFF',
        nodeBg: '#FFFFFF',
        nodeBorder: '#E2E8F0', // slate-200
        text: '#1E293B', // slate-800
        line: '#94A3B8', // slate-400
        rootColor: '#2563EB', // blue-600
        highlight: '#3B82F6',
        font: 'sans-serif',
        connectorStyle: 'curved' // curved, straight, orthogonal
    },
    dark: {
        id: 'dark',
        name: 'Cyber Dark',
        bg: '#0F172A', // slate-900
        canvasBg: '#1E293B', // slate-800
        nodeBg: '#334155', // slate-700
        nodeBorder: '#475569', // slate-600
        text: '#F8FAFC', // slate-50
        line: '#64748B', // slate-500
        rootColor: '#3B82F6', // blue-500
        highlight: '#60A5FA',
        font: 'sans-serif',
        connectorStyle: 'curved'
    },
    blueprint: {
        id: 'blueprint',
        name: 'Blueprint',
        bg: '#19456B', // Deep Blue
        canvasBg: '#1E5085', // Grid Blue
        nodeBg: 'transparent',
        nodeBorder: '#FFFFFF',
        text: '#FFFFFF',
        line: '#FFFFFF',
        rootColor: '#FFFFFF',
        highlight: '#81D4FA',
        font: 'monospace',
        connectorStyle: 'orthogonal',
        dashed: true
    }
};
