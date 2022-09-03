import { position } from '../hooks/useAI.tsx';
import { deltaPosition } from '../hooks/usePlayer.tsx';
import { posToIndex } from '../islands/PlayBoard.tsx';
import { isOutOfBoard } from './getWinner.ts';
import { Queue } from './queue.ts';

type input = {
  size: { x: number; y: number };
  player_pos: position;
  ai_pos: position;
  board: number[];
};

type output = 'up' | 'right' | 'down' | 'left';

type board = (number | null | undefined)[];

const BFS = (pos: position, boardInput: number[]) => {
  const queue = new Queue<position>([pos]);
  const board: board = boardInput.map((cell) => {
    if (cell === 0 || cell === 1) return null;
    return undefined;
  });

  while (queue.length > 0) {
    const task = queue.dequeue();
    if (task !== null) {
      // 4方向を探索
      Object.values(deltaPosition).forEach((delta) => {
        const nextPos = {
          x: task.value.x + delta.x,
          y: task.value.y + delta.y,
        };

        if (isOutOfBoard(nextPos)) return;

        const nextCell = board[posToIndex(nextPos)];

        if (nextCell !== null) {
          // 距離を更新
          const distance = (board[posToIndex(task.value)] ?? 0) + 1;
          if (nextCell === undefined) {
            board[posToIndex(nextPos)] = distance;
            // 次のtaskをqueueに登録
            queue.enqueue(nextPos);
          } else {
            board[posToIndex(nextPos)] = Math.min(nextCell, distance);
          }
        }
      });
    }
  }

  return board;
};

const compareBoard = (AIBoard: board, playerBoard: board) => {
  const evalulation = AIBoard.reduce<number>((e, distanceAI, i) => {
    const distancePlayer = playerBoard[i];

    if (distanceAI === null || distancePlayer === null) return e;
    if (distanceAI === undefined && distancePlayer === undefined) return e;
    if (distanceAI === undefined) return e - 1;
    if (distancePlayer === undefined) return e + 1;

    if (distanceAI > distancePlayer) {
      return e - 1;
    }
    if (distanceAI === distancePlayer) {
      return e;
    }
    if (distanceAI < distancePlayer) {
      return e + 1;
    }

    return e;
  }, 0);

  return evalulation;
};

const getNextBoard = (board: number[], pos: position, player: number) => {
  return board.map((cell, i) => {
    if (i === posToIndex(pos)) {
      return player;
    }

    return cell;
  });
};

type evals = { direction: output; evalation: number }[];

const AI = (input: input): output => {
  const evals = Object.keys(deltaPosition)
    .map((direction) => {
      const delta = deltaPosition[direction as keyof typeof deltaPosition];
      const nextPos = {
        x: input.ai_pos.x + delta.x,
        y: input.ai_pos.y + delta.y,
      };
      const nextCell = input.board[posToIndex(nextPos)];

      if (isOutOfBoard(nextPos) || nextCell !== -1) return;

      const nextBoard = getNextBoard(input.board, nextPos, 1);

      const AIBoard = BFS(input.ai_pos, nextBoard);
      const playerBoard = BFS(input.player_pos, nextBoard);
      const evalation = compareBoard(AIBoard, playerBoard);

      return { direction: direction as output, evalation };
    })
    .filter(Boolean) as evals;

  console.log(evals);

  const maxEval = evals.reduce(
    (max, e) => Math.max(max, e.evalation),
    -100000000
  );
  const nextDirection =
    evals.find((e) => e.evalation === maxEval)?.direction ?? 'up';

  return nextDirection;
};

export default AI;
