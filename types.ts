export enum PieceType {
  Hare = 'HARE',
  Hound = 'HOUND',
}

export enum Player {
  Hounds = 'HOUNDS',
  Hare = 'HARE',
}

export enum GameStatus {
  Playing = 'PLAYING',
  HoundsWin = 'HOUNDS_WIN',
  HareWin = 'HARE_WIN',
  Paused = 'PAUSED',
}

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export interface BoardPosition {
  id: number;
  piece: PieceType | null;
}

export interface GameState {
  board: BoardPosition[];
  currentTurn: Player;
  status: GameStatus;
  level: number;
  difficulty: Difficulty;
  history: BoardPosition[][];
  isHareVisible: boolean;
  trackCharges: number;
}