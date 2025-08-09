import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Difficulty } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI will use random moves.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function getDifficultyPrompt(difficulty: Difficulty): string {
    switch(difficulty) {
        case Difficulty.Easy:
            return "You are a beginner player. You should prioritize immediate moves but might make obvious mistakes or miss long-term strategies. Sometimes choose a random valid move over the optimal one.";
        case Difficulty.Medium:
            return "You are an intermediate player. You should analyze the board to block the opponent and create opportunities for yourself. You should look 1-2 moves ahead. Avoid obvious blunders.";
        case Difficulty.Hard:
            return "You are an expert player. Your goal is to play optimally, thinking several moves ahead to corner the opponent (if you are Hounds) or find an escape route (if you are Hare). You must analyze all valid moves and select the absolute best one based on long-term strategy.";
    }
}

export const getAIMove = async (gameState: GameState, validMoves: number[]) => {
  if (!API_KEY) {
    // Fallback to random move if API key is not available
    const harePosition = gameState.board.find(p => p.piece === 'HARE');
    if (!harePosition) throw new Error("Hare not found");
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return { from: harePosition.id, to: validMoves[randomIndex] };
  }

  const harePosition = gameState.board.find(p => p.piece === 'HARE');
  if (!harePosition) throw new Error("Hare not found on board.");

  const boardString = gameState.board.map(p => `${p.id}:${p.piece || 'empty'}`).join(', ');

  const systemInstruction = `
You are an AI playing the "Hare and Hounds" board game. You are controlling the Hare.
The board has 11 positions, numbered 0 to 10.
The Hounds win by trapping the Hare so it cannot move.
The Hare wins by reaching position 10.
Hounds can only move to a connected position with a smaller number, except on their back row (7,8,9,10) where they can move horizontally. Hounds cannot move backward.
The Hare can move to any connected empty position.

*** NEW RULE: FOG OF WAR ***
You, the Hare, become INVISIBLE if you are not on a space adjacent to a Hound. This is a very powerful advantage.
Your primary strategy should be to move to positions where you are not adjacent to any Hounds, thus becoming invisible and making it harder for them to trap you.

It is currently your turn to move as the Hare.
${getDifficultyPrompt(gameState.difficulty)}
You must choose one of the provided valid moves. Your response must be in JSON format.
`;

  const prompt = `
Current board state: [${boardString}]
The Hare is at position: ${harePosition.id}
You are currently ${gameState.isHareVisible ? 'VISIBLE' : 'INVISIBLE'} to the Hounds.
Your (the Hare's) valid moves are to any of these positions: [${validMoves.join(', ')}]

Analyze the board and the valid moves. Prioritize moves that will make you INVISIBLE on the next turn. Choose the best move to help you, the Hare, escape the Hounds.
Return your chosen move as a JSON object with 'from' and 'to' keys.
For example: {"from": ${harePosition.id}, "to": ${validMoves[0]}}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            from: { type: Type.INTEGER },
            to: { type: Type.INTEGER },
          },
          required: ['from', 'to']
        },
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const move = JSON.parse(jsonText);
    
    if (move && validMoves.includes(move.to) && move.from === harePosition.id) {
        return move;
    } else {
        throw new Error("AI returned an invalid move.");
    }

  } catch (error) {
    console.error("Error getting AI move from Gemini:", error);
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return { from: harePosition.id, to: validMoves[randomIndex] };
  }
};
