import React from 'react';
import { BoardPosition, PieceType } from '../types';
import Piece from './Piece';

interface BoardProps {
  board: BoardPosition[];
  onPieceClick: (id: number) => void;
  onPositionClick: (id: number) => void;
  selectedPieceId: number | null;
  validMoves: number[];
  aiIsThinking: boolean;
  playerTurn: boolean;
  isHareVisible: boolean;
}

// These positions are manually tuned to create the classic board shape using absolute positioning.
const piecePositions: { [key: number]: { top: string; left: string } } = {
  0: { top: '50%', left: '10%' },
  1: { top: '25%', left: '30%' },
  2: { top: '50%', left: '30%' },
  3: { top: '75%', left: '30%' },
  4: { top: '15%', left: '50%' },
  5: { top: '50%', left: '50%' },
  6: { top: '85%', left: '50%' },
  7: { top: '25%', left: '70%' },
  8: { top: '50%', left: '70%' },
  9: { top: '75%', left: '70%' },
  10: { top: '50%', left: '90%' },
};

const Board: React.FC<BoardProps> = ({ board, onPieceClick, onPositionClick, selectedPieceId, validMoves, aiIsThinking, playerTurn, isHareVisible }) => {
  const renderLines = () => {
    const lines = [
      // Diagonals
      [0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 6],
      [4, 7], [5, 7], [5, 8], [5, 9], [6, 9], [7, 10], [8, 10], [9, 10],
      // Horizontals
      [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9]
    ];
    return lines.map(([start, end], index) => {
        const pos1 = piecePositions[start];
        const pos2 = piecePositions[end];
        return (
            <line key={index} x1={pos1.left} y1={pos1.top} x2={pos2.left} y2={pos2.top} stroke="#4a5568" strokeWidth="4" />
        );
    });
  };

  return (
    <div className="relative w-full aspect-[2/1] max-w-3xl mx-auto my-4">
      <svg width="100%" height="100%" className="absolute top-0 left-0">
          {renderLines()}
      </svg>
      {board.map(({ id, piece }) => {
        const pos = piecePositions[id];
        const isSelected = id === selectedPieceId;
        const isValidMove = validMoves.includes(id);

        return (
          <div
            key={id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left, transition: 'all 0.3s ease' }}
            onClick={() => piece ? onPieceClick(id) : onPositionClick(id)}
          >
            {piece ? (
              <Piece 
                type={piece} 
                isSelected={isSelected} 
                aiIsThinking={aiIsThinking && piece === PieceType.Hare} 
                isPlayerTurn={playerTurn}
                isVisible={piece === PieceType.Hare ? isHareVisible : true}
              />
            ) : (
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out
                    ${isValidMove ? 'bg-green-500/50 cursor-pointer ring-2 ring-green-400 scale-110' : 'bg-gray-700/50'}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Board;
