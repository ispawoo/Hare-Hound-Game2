
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Player, GameStatus, PieceType, Difficulty, BoardPosition } from './types';
import { INITIAL_BOARD, BOARD_CONNECTIONS, TOTAL_LEVELS, INITIAL_TRACK_CHARGES } from './constants';
import { getAIMove } from './services/geminiService';
import Board from './components/Board';
import Button from './components/Button';
import Modal from './components/Modal';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogContent from './components/BlogContent';
import Confetti from './components/Confetti';

const AdPlaceholder: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
    return (
        <div className={`bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center p-4 text-gray-500 text-sm ${className}`}>
            <p>{text}</p>
        </div>
    );
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedGame = localStorage.getItem('hareAndHoundsGame');
        if (savedGame) {
            try {
                const parsedGame = JSON.parse(savedGame);
                // Ensure saved games from older versions have new properties
                return {
                    ...parsedGame,
                    isHareVisible: parsedGame.isHareVisible ?? true,
                    trackCharges: parsedGame.trackCharges ?? INITIAL_TRACK_CHARGES,
                };
            } catch (error) {
                console.error("Could not parse saved game. Starting a new game.", error);
                localStorage.removeItem('hareAndHoundsGame');
            }
        }
        return {
            board: INITIAL_BOARD,
            currentTurn: Player.Hounds,
            status: GameStatus.Playing,
            level: 1,
            difficulty: Difficulty.Easy,
            history: [INITIAL_BOARD],
            isHareVisible: true,
            trackCharges: INITIAL_TRACK_CHARGES,
        };
    });

    const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
    const [aiIsThinking, setAiIsThinking] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [showLevelBreak, setShowLevelBreak] = useState(false);
    const [userPlayer] = useState<Player>(Player.Hounds); // User always plays as Hounds
    const [showConfetti, setShowConfetti] = useState(false);
    const [forceHareVisible, setForceHareVisible] = useState(false);

    const updateHareVisibility = useCallback((board: BoardPosition[]): boolean => {
        const harePos = board.find(p => p.piece === PieceType.Hare);
        const houndPositions = board.filter(p => p.piece === PieceType.Hound).map(p => p.id);
        if (!harePos) return false;

        const hareConnections = BOARD_CONNECTIONS[harePos.id];
        return hareConnections.some(conn => houndPositions.includes(conn));
    }, []);

    const getValidMoves = useCallback((pieceId: number, board: BoardPosition[]): number[] => {
        const piece = board.find(p => p.id === pieceId)?.piece;
        if (!piece) return [];

        const connections = BOARD_CONNECTIONS[pieceId];
        const emptyConnections = connections.filter(id => board.find(p => p.id === id)?.piece === null);

        if (piece === PieceType.Hound) {
            return emptyConnections.filter(id => {
                if ([7, 8, 9, 10].includes(pieceId)) {
                    return id < pieceId || ([7, 8, 9, 10].includes(id));
                }
                return id < pieceId;
            });
        }

        if (piece === PieceType.Hare) {
            return emptyConnections;
        }

        return [];
    }, []);

    const checkWinConditions = useCallback((board: BoardPosition[], currentTurn: Player) => {
        const harePosition = board.find(p => p.piece === PieceType.Hare);
        if (!harePosition) return;

        if (harePosition.id === 10) {
            setGameState(prev => ({ ...prev, status: GameStatus.HareWin }));
            return;
        }
        
        // Hounds win if Hare is trapped
        if (currentTurn === Player.Hare) {
            const hareValidMoves = getValidMoves(harePosition.id, board);
            if (hareValidMoves.length === 0) {
                setGameState(prev => ({ ...prev, status: GameStatus.HoundsWin }));
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    }, [getValidMoves]);

    const handleMove = useCallback((fromId: number, toId: number) => {
        setGameState(prev => {
            const newBoard = JSON.parse(JSON.stringify(prev.board));
            const pieceToMove = newBoard.find((p: BoardPosition) => p.id === fromId).piece;
            newBoard.find((p: BoardPosition) => p.id === fromId).piece = null;
            newBoard.find((p: BoardPosition) => p.id === toId).piece = pieceToMove;

            const nextTurn = prev.currentTurn === Player.Hounds ? Player.Hare : Player.Hounds;
            const newHistory = [...prev.history, newBoard];
            const newHareVisibility = updateHareVisibility(newBoard);
            
            const newState = {
                ...prev,
                board: newBoard,
                currentTurn: nextTurn,
                history: newHistory,
                isHareVisible: newHareVisibility,
            };

            checkWinConditions(newBoard, nextTurn);
            return newState;
        });
        setSelectedPieceId(null);
        setForceHareVisible(false); // Hare visibility resets after move
    }, [checkWinConditions, updateHareVisibility]);
    
    const handlePieceClick = (id: number) => {
        if (gameState.status !== GameStatus.Playing || gameState.currentTurn !== userPlayer) return;

        const piece = gameState.board.find(p => p.id === id)?.piece;
        if (piece === PieceType.Hound) {
            setSelectedPieceId(id);
        } else {
            setSelectedPieceId(null);
        }
    };

    const handlePositionClick = (id: number) => {
        if (selectedPieceId !== null) {
            const validMoves = getValidMoves(selectedPieceId, gameState.board);
            if (validMoves.includes(id)) {
                handleMove(selectedPieceId, id);
            }
        }
    };
    
    const startNewGame = (level = 1) => {
        const difficulty = level <= 3 ? Difficulty.Easy : level <= 7 ? Difficulty.Medium : Difficulty.Hard;
        setGameState({
            board: INITIAL_BOARD,
            currentTurn: Player.Hounds,
            status: GameStatus.Playing,
            level: level,
            difficulty: difficulty,
            history: [INITIAL_BOARD],
            isHareVisible: true,
            trackCharges: INITIAL_TRACK_CHARGES,
        });
        setShowConfetti(false);
        localStorage.removeItem('hareAndHoundsGame');
    };

    const nextLevel = () => {
        const next = Math.min(gameState.level + 1, TOTAL_LEVELS);
        setShowLevelBreak(false);
        setShowAd(true);
    };

    const handlePostAd = () => {
        setShowAd(false);
        const next = Math.min(gameState.level + 1, TOTAL_LEVELS);
        startNewGame(next);
    }
    
    const saveGame = () => {
        localStorage.setItem('hareAndHoundsGame', JSON.stringify(gameState));
        alert('Game Saved! 💾');
    };
    
    const handleUndoMove = () => {
        if (gameState.history.length < 3 || gameState.currentTurn !== Player.Hounds) return;
        
        setGameState(prev => {
            // Revert to the state before the player's last move (2 steps back in history)
            const newHistory = prev.history.slice(0, -2);
            const lastBoardState = newHistory[newHistory.length - 1];
            const newHareVisibility = updateHareVisibility(lastBoardState);

            return {
                ...prev,
                board: lastBoardState,
                history: newHistory,
                currentTurn: Player.Hounds,
                status: GameStatus.Playing,
                isHareVisible: newHareVisibility,
            }
        });
        setSelectedPieceId(null);
    }

    const handleTrackHare = () => {
        if (gameState.trackCharges > 0 && !gameState.isHareVisible) {
            setGameState(prev => ({...prev, trackCharges: prev.trackCharges - 1}));
            setForceHareVisible(true);
        }
    }

    useEffect(() => {
        if (gameState.status === GameStatus.Playing && gameState.currentTurn === Player.Hare && !aiIsThinking) {
            setAiIsThinking(true);
            const makeAiMove = async () => {
                const harePosition = gameState.board.find(p => p.piece === PieceType.Hare);
                if (harePosition) {
                    const validMoves = getValidMoves(harePosition.id, gameState.board);
                    if (validMoves.length > 0) {
                        try {
                            const move = await getAIMove(gameState, validMoves);
                            if (move && validMoves.includes(move.to)) {
                                handleMove(move.from, move.to);
                            } else {
                                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                                handleMove(harePosition.id, randomMove);
                            }
                        } catch (error) {
                            console.error("AI move failed, making random move:", error);
                            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                            handleMove(harePosition.id, randomMove);
                        }
                    }
                }
                setAiIsThinking(false);
            };
            setTimeout(makeAiMove, 200);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.currentTurn, gameState.status, gameState.board, userPlayer]);

    useEffect(() => {
        if (gameState.status === GameStatus.HoundsWin) {
            setShowLevelBreak(true);
        }
    }, [gameState.status]);

    const canUndo = gameState.history.length >= 3 && gameState.currentTurn === Player.Hounds && gameState.status === GameStatus.Playing;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex flex-col items-center">
            {showConfetti && <Confetti />}
            <div className="w-full max-w-screen-xl mx-auto flex flex-col flex-grow">
                <Header level={gameState.level} difficulty={gameState.difficulty} />
                
                <div className="my-6">
                    <AdPlaceholder text="Banner Ad Space (Top)" className="h-24" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_160px] gap-6 flex-grow">
                    <div className="hidden lg:flex items-center">
                        <AdPlaceholder text="Vertical Ad (Left)" className="w-full h-96" />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <main className="w-full lg:w-2/3">
                            <div className="bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700">
                                 <Board
                                    board={gameState.board}
                                    onPieceClick={handlePieceClick}
                                    onPositionClick={handlePositionClick}
                                    selectedPieceId={selectedPieceId}
                                    validMoves={selectedPieceId ? getValidMoves(selectedPieceId, gameState.board) : []}
                                    aiIsThinking={aiIsThinking}
                                    playerTurn={gameState.currentTurn === userPlayer}
                                    isHareVisible={gameState.isHareVisible || forceHareVisible}
                                />

                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <Button onClick={() => startNewGame(1)}>New Game 🚀</Button>
                                    <Button onClick={saveGame}>Save Game 💾</Button>
                                    <Button onClick={() => setShowInstructions(true)}>How to Play❓</Button>
                                    <Button onClick={handleUndoMove} disabled={!canUndo}>Undo ↩️</Button>
                                </div>
                            </div>
                        </main>

                        <aside className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b-2 border-cyan-500 pb-2">Game Status</h2>
                            <div className="space-y-3 text-lg">
                               <p><strong>📈 Level:</strong> <span className="font-mono text-yellow-300">{gameState.level} / {TOTAL_LEVELS}</span></p>
                               <p><strong>🧠 Difficulty:</strong> <span className="font-mono text-yellow-300">{gameState.difficulty}</span></p>
                               <p><strong>🎲 Turn:</strong> 
                                    <span className={`font-bold ml-2 px-2 py-1 rounded ${gameState.currentTurn === Player.Hounds ? 'bg-blue-500' : 'bg-red-500'}`}>
                                        {gameState.currentTurn}
                                    </span>
                               </p>
                               <div className="pt-2">
                                   <p><strong>🎯 Track Hare:</strong> 
                                        <span className="font-mono text-yellow-300 ml-2">{gameState.trackCharges} charges left</span>
                                   </p>
                                   <button onClick={handleTrackHare} disabled={gameState.trackCharges === 0 || gameState.isHareVisible} className="mt-2 w-full px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg shadow-md hover:bg-yellow-700 active:bg-yellow-800 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                       Use Track 🐾
                                   </button>
                               </div>
                                {aiIsThinking && <p className="text-cyan-400 animate-pulse">Hare is thinking... 🤔</p>}
                                {!aiIsThinking && !gameState.isHareVisible && <p className="text-yellow-400 animate-pulse">Hare is hidden! 🤫</p>}
                            </div>
                        </aside>
                    </div>

                    <div className="hidden lg:flex items-center">
                        <AdPlaceholder text="Vertical Ad (Right)" className="w-full h-96" />
                    </div>
                </div>
                
                <div className="my-6">
                    <AdPlaceholder text="Banner Ad Space (Bottom)" className="h-24" />
                </div>

                <BlogContent />
            </div>

            {showInstructions && (
                <Modal onClose={() => setShowInstructions(false)}>
                    <h2 className="text-3xl font-bold text-cyan-400 mb-4">How to Play Hare and Hounds 📜</h2>
                    <div className="text-left space-y-4 text-gray-300">
                         <p>Hare and Hounds is a classic strategy game of pursuit and evasion.</p>
                        <div>
                            <h3 className="text-xl font-semibold text-yellow-300">Your Goal (as Hounds) 🐕</h3>
                            <p>Your objective is to trap the Hare so it cannot make a legal move. You control the three blue pieces (the Hounds).</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-yellow-300">The Hare's Goal 🐇</h3>
                            <p>The Hare (the red piece) wins if it can slip past all the Hounds and reach the rightmost position on the board (the starting position of the Hounds).</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-yellow-300">Movement Rules 🐾</h3>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li><strong>Hounds:</strong> Can only move one step forward or diagonally forward to an empty spot. They can also move horizontally on their starting row. They can NEVER move backward.</li>
                                <li><strong>Hare:</strong> Can move one step in any direction (forward, backward, diagonally, or sideways) to an adjacent empty spot.</li>
                                <li>Pieces cannot jump over other pieces.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-green-400">✨ New Feature: Fog of War!</h3>
                             <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>The Hare becomes invisible if it is not next to a Hound.</li>
                                <li>Use your limited "Track Hare" ability to reveal its location for one turn.</li>
                            </ul>
                        </div>
                         <p className="text-center pt-4">
                           <Button onClick={() => setShowInstructions(false)}>Got It! 👍</Button>
                         </p>
                    </div>
                </Modal>
            )}

            {gameState.status === GameStatus.HareWin && (
                <Modal onClose={() => startNewGame(gameState.level)}>
                    <h2 className="text-5xl font-extrabold text-red-500 mb-4">You Lose! 😞</h2>
                    <p className="text-xl text-gray-300 mb-6">The clever Hare has escaped!</p>
                    <Button onClick={() => startNewGame(gameState.level)}>Try Again 💪</Button>
                </Modal>
            )}
             
            {showLevelBreak && gameState.status === GameStatus.HoundsWin && (
                <Modal onClose={() => {}}>
                    <h2 className="text-5xl font-extrabold text-green-400 mb-4">You Win! 🎉</h2>
                    <p className="text-xl text-gray-300 mb-2">You've successfully cornered the Hare!</p>
                    <p className="text-lg text-yellow-400 mb-6">🏆 Reward: +1000 Points!</p>
                    <Button onClick={nextLevel}>
                        {gameState.level < TOTAL_LEVELS ? `Proceed to Level ${gameState.level + 1} ➡️` : 'Play Again 🚀'}
                    </Button>
                </Modal>
            )}

            {showAd && (
                 <Modal onClose={() => {}} hideCloseButton={true}>
                    <h2 className="text-3xl font-bold text-cyan-400 mb-4">A word from our sponsors 📺</h2>
                    <div className="bg-gray-700 w-full h-64 flex items-center justify-center rounded-lg my-4">
                        <p className="text-gray-400">[ Simulated Ad Content ]</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Your game will resume after the ad.</p>
                    <Button onClick={handlePostAd}>Skip Ad & Continue</Button>
                </Modal>
            )}
            <Footer />
        </div>
    );
};

export default App;
