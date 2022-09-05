import { useCallback, useEffect, useRef } from "preact/hooks";
import { cellPos } from "../components/Board.tsx";
import { calcNextPos, direction, position } from "./useAI.tsx";

export const deltaPosition: Record<direction, { x: number; y: number }> = {
  up: {
    x: 0,
    y: -1,
  },
  right: {
    x: 1,
    y: 0,
  },
  down: {
    x: 0,
    y: 1,
  },
  left: {
    x: -1,
    y: 0,
  },
};

const usePlayer = (initialPosition: position) => {
  const position = useRef(initialPosition);
  const direction = useRef<cellPos>(null);
  const nextDirection = useRef<cellPos>(null);

  const getNextPlayerPosition = () => {
    direction.current = nextDirection.current;

    if (direction.current !== null) {
      position.current = calcNextPos(position.current, direction.current);
    }

    return {
      position: position.current,
      direction: direction.current,
    };
  };

  const setPosition = (pos: position) => {
    position.current = pos;
  };

  const setDirection = (dir: cellPos) => {
    direction.current = dir;
    nextDirection.current = dir;
  };

  const getDirection = () => {
    return direction.current;
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (["ArrowUp", "w"].includes(e.key) && direction.current !== "down") {
      nextDirection.current = "up";
    }
    if (["ArrowRight", "d"].includes(e.key) && direction.current !== "left") {
      nextDirection.current = "right";
    }
    if (["ArrowDown", "s"].includes(e.key) && direction.current !== "up") {
      nextDirection.current = "down";
    }
    if (["ArrowLeft", "a"].includes(e.key) && direction.current !== "right") {
      nextDirection.current = "left";
    }
  };

  useEffect(() => {
    addEventListener("keydown", onKeydown);

    return () => {
      removeEventListener("keydown", onKeydown);
    };
  }, []);

  return {
    getNextPlayerPosition,
    setPosition,
    setDirection,
    getDirection,
  };
};

export default usePlayer;
