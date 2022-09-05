import { cell, cellPos } from "../components/Board.tsx";
import { boardSize, posToIndex } from "../islands/PlayBoard.tsx";
import { deltaPosition } from "./usePlayer.tsx";
import initAI, { ai_response } from "../utils/ai/wasm.js";
import { useEffect, useRef } from "preact/hooks";
import { isOutOfBoard } from "../utils/getWinner.ts";

export type position = {
  x: number;
  y: number;
};

const cellId = {
  player: 0,
  AI: 1,
};

export type direction = "up" | "right" | "down" | "left";

export const calcNextPos = (pos: position, direction: direction) => {
  const delta = deltaPosition[direction as keyof typeof deltaPosition];
  return ({
    x: pos.x + delta.x,
    y: pos.y + delta.y,
  });
};

const useAI = () => {
  useEffect(() => {
    initAI(new URL("wasm_bg.wasm", location.origin)).then(() => {
      console.log("initialized");
    });
  }, []);

  // Record<相手の動く方向, 自分の動く方向>
  const nextDirection = useRef<Record<direction, direction | null>>({
    up: null,
    right: null,
    down: null,
    left: null,
  });

  const cacheTimeout = useRef<number | null>(null);

  const calcNextAIPosition = async (
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

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();

    const direction = text as Exclude<
      cellPos,
      null
    >;

    return { direction, nextPos: calcNextPos(AIPos, direction) };
  };

  const cacheNextAIPosition = (
    AIPos: position,
    playerPos: position,
    board: cell[],
  ) => {
    Object.keys(deltaPosition).forEach((direction) => {
      const nextPos = calcNextPos(playerPos, direction as direction);

      if (isOutOfBoard(nextPos)) return;

      const nextBord: cell[] = board.map((cell, i) => {
        if (i === posToIndex(nextPos)) {
          return {
            ...cell,
            owner: "player",
          };
        }

        return cell;
      });

      calcNextAIPosition(AIPos, nextPos, nextBord).then((next) => {
        nextDirection.current[direction as direction] = next.direction;
      });
    });
  };

  const _getNextAIPosition = async (
    AIPos: position,
    playerPos: position,
    playerDirection: cellPos,
    board: cell[],
  ) => {
    // プレイヤーが動いて無ければ
    if (playerDirection === null) {
      // 動かない
      return { direction: null, nextPos: AIPos };
    }

    // プレイヤーが盤面の外に行っていれば
    if (isOutOfBoard(playerPos)) {
      // 動けるところに動く
      const movableDirecition = Object.keys(deltaPosition).find(
        (direction) => {
          const nextPos = calcNextPos(AIPos, direction as direction);
          return board[posToIndex(nextPos)].owner === null;
        },
      ) as direction;

      return {
        direction: movableDirecition ?? "up",
        nextPos: calcNextPos(AIPos, movableDirecition ?? "up"),
      };
    }

    // 動く方向がキャッシュされていれば
    const direction = nextDirection.current[playerDirection];
    if (direction !== null) {
      // キャッシュを読み取る
      return { direction, nextPos: calcNextPos(AIPos, direction) };
    }

    // 動く方向がキャッシュされていなければ
    return await calcNextAIPosition(AIPos, playerPos, board);
  };

  const getNextAIPosition = async (
    AIPos: position,
    playerPos: position,
    playerDirection: cellPos,
    board: cell[],
  ) => {
    // 次のAIの情報を取得
    const next = await _getNextAIPosition(
      AIPos,
      playerPos,
      playerDirection,
      board,
    );

    const nextBoard: cell[] = board.map((cell, i) => {
      if (i === posToIndex(next.nextPos)) {
        return {
          ...cell,
          owner: "AI",
        };
      }

      return cell;
    });

    // キャッシュを削除
    clearCache();

    // 次のキャッシュを生成
    cacheNextAIPosition(next.nextPos, playerPos, nextBoard);

    return next;
  };

  const clearCache = () => {
    // キャッシュ作業を停止
    if (cacheTimeout.current) {
      clearTimeout(cacheTimeout.current);
    }

    nextDirection.current = {
      up: null,
      right: null,
      down: null,
      left: null,
    };
  };

  return { getNextAIPosition, clearCache };
};

export default useAI;
