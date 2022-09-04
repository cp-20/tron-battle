import { cell, cellPos } from "../components/Board.tsx";
import { boardSize } from "../islands/PlayBoard.tsx";
import { deltaPosition } from "./usePlayer.tsx";
import initAI, { ai_response } from "../utils/ai/wasm.js";
import { useEffect, useRef } from "preact/hooks";

export type position = {
  x: number;
  y: number;
};

const cellId = {
  player: 0,
  AI: 1,
};

type api = (body: string) => Exclude<cellPos, null>;

const useAI = () => {
  useEffect(() => {
    initAI(new URL("wasm_bg.wasm", location.origin)).then(() => {
      console.log("initialized");
    });
  }, []);

  const getNextAIPosition = (
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

    const bodyString = JSON.stringify(body);

    const res = ai_response(bodyString);

    const text = res.toLowerCase().slice(1, -1);

    console.log(performance.now() - start);

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
