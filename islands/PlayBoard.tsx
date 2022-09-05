/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";

import Board, { cell, cellPos, ownerType } from "../components/Board.tsx";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import usePlayer from "../hooks/usePlayer.tsx";
import useAI, { direction, position } from "../hooks/useAI.tsx";
import getWinner from "../utils/getWinner.ts";
import BoardScreen, { state } from "../components/BoardScreen.tsx";

export type diffType = {
  x: number;
  y: number;
  direction: cellPos;
};

export type diffTypeExcluseNull = {
  x: number;
  y: number;
  direction: direction;
};

export type deathDiff = {
  x: number;
  y: number;
}[];

export type diff = Record<Exclude<ownerType, null>, diffType>;

export const boardSize = {
  x: 20,
  y: 15,
};

export const reverseDirection: Record<
  direction,
  direction
> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

const getRandomPos = () => ({
  x: Math.floor(Math.random() * boardSize.x),
  y: Math.floor(Math.random() * boardSize.y),
});

const getAgainstPos = (pos: position) => ({
  x: boardSize.x - pos.x - 1,
  y: boardSize.y - pos.y - 1,
});

const initialPlayerPosition = getRandomPos();
const initialAIPosition = getAgainstPos(initialPlayerPosition);

// アップデート間隔[s]
export const updateInterval = 0.3;

export const posToIndex = (pos: position) => (pos.x + pos.y * boardSize.x);

const initialBoard: cell[] = new Array(boardSize.x * boardSize.y).fill(0).map(
  (_, i) => {
    if (i === posToIndex(initialAIPosition)) {
      return {
        owner: "AI",
        isTop: true,
        previousCell: null,
        nextCell: null,
      };
    }
    if (i === posToIndex(initialPlayerPosition)) {
      return {
        owner: "player",
        isTop: true,
        previousCell: null,
        nextCell: null,
      };
    }

    return ({
      owner: null,
      previousCell: null,
      nextCell: null,
      isTop: false,
    });
  },
);

const PlayBoard = () => {
  const [board, setBoard] = useState(initialBoard);
  const boardRef = useRef(initialBoard);
  const [diff, setDiff] = useState<diff | deathDiff>({
    AI: {
      ...initialAIPosition,
      direction: null,
    },
    player: {
      ...initialPlayerPosition,
      direction: null,
    },
  });
  const AIPos = useRef<position>(initialAIPosition);

  const { getNextPlayerPosition, setPosition, setDirection, getDirection } =
    usePlayer(
      initialPlayerPosition,
    );
  const { getNextAIPosition, clearCache } = useAI();

  const [screenState, setScreenState] = useState<state>("title");
  const screenStateRef = useRef<state>(screenState);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    screenStateRef.current = screenState;
  }, [screenState]);

  const processing = useRef(false);
  const gameLoop = async () => {
    if (processing.current) return;
    processing.current = true;

    if (["win", "lose"].includes(screenStateRef.current)) {
      clearCache();
      return processing.current = false;
    }

    // プレイヤーの情報
    const { position: playerPos, direction: playerDirection } =
      getNextPlayerPosition();

    // プレイヤーが止まってたら処理をしない
    if (playerDirection === null) return processing.current = false;

    setScreenState("playing");

    // AIの情報
    const board: cell[] = boardRef.current.map((cell, i) => {
      if (i === posToIndex(playerPos)) {
        return {
          ...cell,
          owner: "player",
        };
      }

      return cell;
    });

    const { direction: AIdirection, nextPos: AINextPos }: {
      direction: cellPos;
      nextPos: position;
    } = await getNextAIPosition(
      AIPos.current,
      playerPos,
      playerDirection,
      board,
    );

    setBoard((board) => {
      return board.map((cell, i) => {
        if (cell.isTop && cell.owner === "player") {
          return {
            ...cell,
            isTop: false,
            nextCell: playerDirection,
          };
        }

        if (
          i === posToIndex(playerPos) && playerDirection !== null &&
          cell.owner === null
        ) {
          return {
            ...cell,
            isTop: true,
            previousCell: reverseDirection[playerDirection],
            owner: "player",
          };
        }

        if (i === posToIndex(AIPos.current)) {
          return {
            ...cell,
            isTop: false,
            nextCell: AIdirection,
          };
        }

        if (
          i === posToIndex(AINextPos) && AIdirection !== null &&
          cell.owner === null
        ) {
          return {
            ...cell,
            owner: "AI",
            isTop: true,
            previousCell: reverseDirection[AIdirection],
          };
        }

        return cell;
      });
    });

    AIPos.current = AINextPos;

    // 勝敗が決まっているか
    const { winner, deathPos } = getWinner(
      boardRef.current,
      playerPos,
      AINextPos,
    );

    if (winner !== null) {
      if (winner === "player") {
        setScreenState("win");
      }
      if (winner === "AI") {
        setScreenState("lose");
      }
      setDiff(deathPos);
      return processing.current = false;
    }

    setDiff({
      AI: {
        ...AINextPos,
        direction: AIdirection,
      },
      player: {
        ...playerPos,
        direction: playerDirection,
      },
    });

    processing.current = false;
  };

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 * updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const onKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === " " && ["win", "lose"].includes(screenState)) {
      e.stopPropagation();
      const initialPlayerPosition = getRandomPos();
      const initialAIPosition = getAgainstPos(initialPlayerPosition);

      const initialBoard: cell[] = new Array(boardSize.x * boardSize.y).fill(0)
        .map(
          (_, i) => {
            if (i === posToIndex(initialAIPosition)) {
              return {
                owner: "AI",
                isTop: true,
                previousCell: null,
                nextCell: null,
              };
            }
            if (i === posToIndex(initialPlayerPosition)) {
              return {
                owner: "player",
                isTop: true,
                previousCell: null,
                nextCell: null,
              };
            }

            return ({
              owner: null,
              previousCell: null,
              nextCell: null,
              isTop: false,
            });
          },
        );

      setBoard(initialBoard);
      setDiff({
        AI: {
          ...initialAIPosition,
          direction: null,
        },
        player: {
          ...initialPlayerPosition,
          direction: null,
        },
      });
      setPosition(initialPlayerPosition);
      AIPos.current = initialAIPosition;
      setDirection(null);
      setScreenState("title");
    }
  }, [screenState]);

  useEffect(() => {
    addEventListener("keydown", onKeydown);

    return () => {
      removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);

  return (
    <>
      <div class={tw`relative`}>
        <Board size={boardSize} board={board} diff={diff} />
        <div class={tw`absolute w-full h-full top-0 left-0`}>
          <BoardScreen state={screenState} />
        </div>
      </div>
    </>
  );
};

export default PlayBoard;
