import { useEffect } from 'react';

/**
 * Global Keyboard Shortcuts Hook
 * @param {Object} handlers - Map of action names to functions.
 * @param {Object} dependencies - Array of dependencies to re-bind listeners.
 */
export const useKeyboardGlobal = (handlers, dependencies = []) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in an input or textarea
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            // Delete / Backspace -> Delete Node
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (handlers.deleteNode) {
                    handlers.deleteNode();
                }
            }

            // Enter / Tab -> Add Child
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // Prevent tab focus change
                if (handlers.addChild) {
                    handlers.addChild();
                }
            }

            // Ctrl+Z / Ctrl+Shift+Z -> Undo / Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    if (handlers.redo) handlers.redo();
                } else {
                    if (handlers.undo) handlers.undo();
                }
            }

            // Ctrl+C -> Copy node
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                if (handlers.copyNode) handlers.copyNode();
            }

            // Ctrl+V -> Paste node
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                if (handlers.pasteNode) handlers.pasteNode();
            }

            // Ctrl+D -> Duplicate node (same parent)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (handlers.duplicateNode) handlers.duplicateNode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, dependencies);
};
