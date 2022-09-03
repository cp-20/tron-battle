/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import {
  boardSize,
  deathDiff,
  diff,
  diffTypeExcluseNull,
  reverseDirection,
  updateInterval,
} from "../islands/PlayBoard.tsx";
import { useEffect, useRef } from "preact/hooks";
import { position } from "../hooks/useAI.tsx";
import { deltaPosition } from "../hooks/usePlayer.tsx";

export type boardSize = {
  x: number;
  y: number;
};

export type ownerType = "AI" | "player" | null;
export type cellPos = "up" | "right" | "down" | "left" | null;

export type cell = {
  owner: ownerType;
  previousCell: cellPos;
  nextCell: cellPos;
  isTop: boolean;
};

export type boardProps = {
  size: boardSize;
  board: cell[];
  diff: diff | deathDiff;
};

const cellSize = 16;

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  pos: position,
  adjust?: position,
) => {
  ctx.beginPath();
  ctx.arc(
    pos.x * 17 + cellSize / 2 + (adjust?.x ?? 0),
    pos.y * 17 + cellSize / 2 + (adjust?.y ?? 0),
    cellSize / 3 - 0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
};

const drawAnimation = (
  ctx: CanvasRenderingContext2D,
  pos: diffTypeExcluseNull,
  tick: number,
) => {
  const delta = deltaPosition[pos.direction];

  drawPoint(
    ctx,
    {
      x: pos.x,
      y: pos.y,
    },
    {
      x: delta.x *
        ((tick - (60 * updateInterval)) * (cellSize) / 60 / updateInterval),
      y: delta.y *
        ((tick - (60 * updateInterval)) * (cellSize) / 60 / updateInterval),
    },
  );
};

type square = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const cellSquare: Record<Exclude<cellPos, null>, square> = {
  up: {
    x: cellSize / 6,
    y: -1,
    width: cellSize / 3 * 2,
    height: cellSize / 2 + 1,
  },
  right: {
    x: cellSize / 2,
    y: cellSize / 6,
    width: cellSize / 2 + 1,
    height: cellSize / 3 * 2,
  },
  down: {
    x: cellSize / 6,
    y: cellSize / 2,
    width: cellSize / 3 * 2,
    height: cellSize / 2 + 1,
  },
  left: {
    x: -1,
    y: cellSize / 6,
    width: cellSize / 2 + 1,
    height: cellSize / 3 * 2,
  },
};

const colors: Record<Exclude<ownerType, null>, string> = {
  player: "#fa205f",
  AI: "#f6901f",
};

const Board = ({ size, board, diff }: boardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);

  const width = size.x * (cellSize + 1) - 1;
  const height = size.y * (cellSize + 1) - 1;

  const diffRef = useRef<diff | deathDiff>(diff);

  const tick = useRef(0);

  useEffect(() => {
    diffRef.current = diff;
  }, [diff]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      context.current = ctx;

      if (ctx && diff !== null) {
        // 盤面
        ctx.fillStyle = "#355248";
        ctx.fillRect(0, 0, width, height);

        // グリッド線
        ctx.strokeStyle = "#2e473e";
        ctx.lineWidth = 1;
        for (let x = 0; x < size.x - 1; x++) {
          ctx.beginPath();
          ctx.moveTo((x + 1) * (cellSize + 1), 0);
          ctx.lineTo((x + 1) * (cellSize + 1), height);
          ctx.stroke();
        }
        for (let y = 0; y < size.y - 1; y++) {
          ctx.beginPath();
          ctx.moveTo(0, (y + 1) * (cellSize + 1));
          ctx.lineTo(width, (y + 1) * (cellSize + 1));
          ctx.stroke();
        }

        tick.current = 0;

        // 盤面描画
        board.forEach((cell, i) => {
          if (
            cell.owner !== null &&
            (cell.isTop === false ||
              (cell.isTop === true && cell.previousCell === null))
          ) {
            ctx.fillStyle = colors[cell.owner];
            const position = {
              x: i % size.x,
              y: Math.floor(i / size.x),
            };
            drawPoint(ctx, position);

            if (cell.previousCell !== null) {
              const squarePrevious = cellSquare[cell.previousCell];
              ctx.fillRect(
                position.x * (cellSize + 1) + squarePrevious.x,
                position.y * (cellSize + 1) + squarePrevious.y,
                squarePrevious.width,
                squarePrevious.height,
              );
              const squareNext =
                cellSquare[reverseDirection[cell.previousCell]];
              const previousPos = {
                x: position.x + deltaPosition[cell.previousCell].x,
                y: position.y + deltaPosition[cell.previousCell].y,
              };
              ctx.fillRect(
                previousPos.x * (cellSize + 1) + squareNext.x,
                previousPos.y * (cellSize + 1) + squareNext.y,
                squareNext.width,
                squareNext.height,
              );
            }
          }
        });

        if (Array.isArray(diff)) {
          diff.forEach((pos) => {
            const basePos = {
              x: pos.x * (cellSize + 1),
              y: pos.y * (cellSize + 1),
            };
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(basePos.x + 2, basePos.y + 2);
            ctx.lineTo(basePos.x + cellSize - 2, basePos.y + cellSize - 2);
            ctx.moveTo(basePos.x + 2, basePos.y + cellSize - 2);
            ctx.lineTo(basePos.x + cellSize - 2, basePos.y + 2);
            ctx.stroke();
          });
        }
      }
    }
  }, [size, diff]);

  const drawLoop = (() => {
    const frameId = requestAnimationFrame(drawLoop);

    const diff = diffRef.current;
    if (Array.isArray(diff)) return;

    if (context.current !== null) {
      if (diff.AI.direction !== null) {
        context.current.fillStyle = colors.AI;
        drawAnimation(
          context.current,
          diff.AI as diffTypeExcluseNull,
          tick.current,
        );
      }
      if (diff.player.direction !== null) {
        context.current.fillStyle = colors.player;
        drawAnimation(
          context.current,
          diff.player as diffTypeExcluseNull,
          tick.current,
        );
      }
    }
    tick.current++;
  });

  useEffect(() => {
    requestAnimationFrame(drawLoop);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "40rem" }}
    >
    </canvas>
  );
};

export default Board;
