import { cell, cellPos } from "../components/Board.tsx";
import { boardSize } from "../islands/PlayBoard.tsx";
import { deltaPosition } from "./usePlayer.tsx";

export type position = {
  x: number;
  y: number;
};

const cellId = {
  player: 0,
  AI: 1,
};

const useAI = () => {
  const getNextAIPosition = async (
    AIPos: position,
    playerPos: position,
    board: cell[],
  ) => {
    const body = {
      size: boardSize,
      player_pos: playerPos,
      ai_pos: AIPos,
      board: board.map((cell) => cell.owner !== null ? cellId[cell.owner] : -1),
    };

    const start = performance.now();

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify(body),
    });

    console.log(performance.now() - start);

    const text = await res.text();

    const direction = text as Exclude<
      cellPos,
      null
    >;

    const nextPos = {
      x: AIPos.x + deltaPosition[direction].x,
      y: AIPos.y + deltaPosition[direction].y,
    };

    return { direction, nextPos };
  };

  return { getNextAIPosition };
};

export default useAI;
