
import React, { useEffect } from 'react';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, type = 'confirm' }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (type === 'confirm' && onCancel) onCancel();
                else if (onConfirm) onConfirm();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, type, onConfirm, onCancel]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (type === 'confirm' && onCancel) onCancel();
        else if (onConfirm) onConfirm();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-[400px] p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="modal-title" className="text-lg font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 mb-6 font-medium whitespace-pre-wrap">{message}</p>

                <div className="flex justify-end gap-2">
                    {type === 'confirm' && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            CANCEL
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {type === 'alert' ? 'OK' : 'CONFIRM'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
