import { cell } from '../components/Board.tsx';
import { position } from '../hooks/useAI.tsx';
import { boardSize, deathDiff, posToIndex } from '../islands/PlayBoard.tsx';

export const isOutOfBoard = (pos: position) =>
  pos.x < 0 || boardSize.x <= pos.x || pos.y < 0 || boardSize.y <= pos.y;

export const isStacking = (board: cell[], pos: position) =>
  board[posToIndex(pos)].owner !== null;

export const isSamePos = (pos1: position, pos2: position) =>
  pos1.x === pos2.x && pos1.y === pos2.y;

const getPreviousPos = (pos: position): position => ({
  x: Math.min(Math.max(pos.x, 0), boardSize.x - 1),
  y: Math.min(Math.max(pos.y, 0), boardSize.y - 1),
});

type winner = 'AI' | 'player' | null;

type winnerValue = {
  winner: winner;
  deathPos: deathDiff;
};

const getWinner = (
  board: cell[],
  nextPlayerPos: position,
  nextAIPos: position
): winnerValue => {
  const isPlayerWin = isOutOfBoard(nextAIPos) || isStacking(board, nextAIPos);
  const isAIWin =
    isOutOfBoard(nextPlayerPos) || isStacking(board, nextPlayerPos);

  const playerDeathPos = isAIWin
    ? isOutOfBoard(nextPlayerPos)
      ? getPreviousPos(nextPlayerPos)
      : nextPlayerPos
    : {
        x: -1,
        y: -1,
      };

  const AIDeathPos = isPlayerWin
    ? isOutOfBoard(nextAIPos)
      ? getPreviousPos(nextAIPos)
      : nextAIPos
    : {
        x: -1,
        y: -1,
      };

  if (isPlayerWin && isAIWin) {
    return {
      winner: 'player',
      deathPos: [playerDeathPos, AIDeathPos],
    };
  }
  if (isPlayerWin) {
    return {
      winner: 'player',
      deathPos: [AIDeathPos],
    };
  }
  if (isAIWin) {
    return {
      winner: 'AI',
      deathPos: [playerDeathPos],
    };
  }

  if (isSamePos(nextPlayerPos, nextAIPos)) {
    return {
      winner: 'AI',
      deathPos: [nextPlayerPos],
    };
  }

  return {
    winner: null,
    deathPos: [],
  };
};

export default getWinner;
