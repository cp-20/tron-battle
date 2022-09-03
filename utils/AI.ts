import { deltaPosition } from '../hooks/usePlayer.tsx';
import { posToIndex } from '../islands/PlayBoard.tsx';
import { isOutOfBoard } from './getWinner.ts';

type input = {
  size: { x: number; y: number };
  player_pos: { x: number; y: number };
  ai_pos: { x: number; y: number };
  board: number[];
};

type output = 'up' | 'right' | 'down' | 'left';

const AI = (input: input): output => {
  const evalation: [output, number][] = Object.keys(deltaPosition).map(
    (direction) => {
      for (let i = 1; ; i++) {
        const delta = deltaPosition[direction as keyof typeof deltaPosition];
        const pos = {
          x: input.ai_pos.x + delta.x * i,
          y: input.ai_pos.y + delta.y * i,
        };

        // 既に盤面が埋まってたら
        if (isOutOfBoard(pos) || input.board[posToIndex(pos)] >= 0) {
          return [direction as output, i];
        }
      }
    }
  );

  const maxEval = evalation.reduce((acc, cur) => Math.max(acc, cur[1]), 0);
  const nextDir: output =
    evalation.find((dir) => dir[1] === maxEval)?.[0] ?? 'up';

  return nextDir;
};

export default AI;
