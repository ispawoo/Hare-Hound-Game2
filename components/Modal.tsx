
import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, hideCloseButton = false }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 m-4 max-w-lg w-full text-center border-2 border-cyan-500/50 transform transition-all duration-300 scale-95 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modal-pop 0.3s ease-out forwards' }}
      >
        {!hideCloseButton && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl transition-colors"
          >
            &times;
          </button>
        )}
        {children}
      </div>
      <style>{`
        @keyframes modal-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
