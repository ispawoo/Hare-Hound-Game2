import React from 'react';
import { PieceType } from '../types';

interface PieceProps {
  type: PieceType;
  isSelected: boolean;
  aiIsThinking: boolean;
  isPlayerTurn: boolean;
  isVisible: boolean;
}

const Piece: React.FC<PieceProps> = ({ type, isSelected, aiIsThinking, isPlayerTurn, isVisible }) => {
  const baseStyle = "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 transition-all duration-300 ease-in-out";
  
  const typeStyle = type === PieceType.Hare
    ? "bg-red-500 border-red-300"
    : "bg-blue-600 border-blue-400";

  const selectionStyle = isSelected ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-yellow-400 scale-110' : '';
  
  const thinkingStyle = aiIsThinking ? 'animate-pulse' : '';

  const turnStyle = type === PieceType.Hound && isPlayerTurn ? 'cursor-pointer hover:scale-105' : 'cursor-default';

  const visibilityStyle = !isVisible ? 'opacity-40 border-dashed' : 'opacity-100';

  return (
    <div className={`${baseStyle} ${typeStyle} ${selectionStyle} ${thinkingStyle} ${turnStyle} ${visibilityStyle}`}>
      {type === PieceType.Hare ? '🐇' : '🐕'}
    </div>
  );
};

export default Piece;
