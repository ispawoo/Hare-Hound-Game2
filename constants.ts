import { PieceType, type BoardPosition } from './types';

export const BOARD_CONNECTIONS: { [key: number]: number[] } = {
  0: [1, 2, 3],
  1: [0, 2, 4, 5],
  2: [0, 1, 3, 5],
  3: [0, 2, 5, 6],
  4: [1, 5, 7],
  5: [1, 2, 3, 4, 6, 7, 8, 9],
  6: [3, 5, 9],
  7: [4, 5, 8, 10],
  8: [5, 7, 9, 10],
  9: [5, 6, 8, 10],
  10: [7, 8, 9],
};

export const INITIAL_BOARD: BoardPosition[] = [
  { id: 0, piece: PieceType.Hare },
  { id: 1, piece: null },
  { id: 2, piece: null },
  { id: 3, piece: null },
  { id: 4, piece: null },
  { id: 5, piece: null },
  { id: 6, piece: null },
  { id: 7, piece: null },
  { id: 8, piece: PieceType.Hound },
  { id: 9, piece: PieceType.Hound },
  { id: 10, piece: PieceType.Hound },
];

export const TOTAL_LEVELS = 10;
export const INITIAL_TRACK_CHARGES = 3;
