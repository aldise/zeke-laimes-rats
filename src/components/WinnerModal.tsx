import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Segment } from '../types';
import { X } from 'lucide-react';

interface WinnerModalProps {
  winner: Segment | null;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="absolute top-0 left-0 w-full h-3" 
              style={{ backgroundColor: winner.color }}
            />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4">Apsveicam!</h2>
            <p className="text-gray-500 mb-6">Jūs laimējāt:</p>
            
            <div 
              className="py-6 px-4 rounded-2xl mb-8 shadow-inner"
              style={{ backgroundColor: winner.color, color: winner.textColor }}
            >
              <span className="text-3xl font-black tracking-tight">{winner.text}</span>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Turpināt
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
