/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { useEffect, useState } from "preact/hooks";
import { winnerFile } from "../routes/api/winners.ts";

export type state = "title" | "playing" | "win" | "lose";

export type screenProps = {
  state: state;
};

const BoardScreen = ({ state }: screenProps) => {
  const [data, setData] = useState<winnerFile | null>(null);

  useEffect(() => {
    fetch("/api/winners").then((res) => res.json()).then((res: winnerFile) => {
      console.log(res);

      setData(res);
    });
  }, [setData, state]);

  if (state === "title") {
    return (
      <div
        class={tw`w-full h-full flex flex-col items-center`}
        style={{ backgroundColor: "rgb(0 0 0 / 50%)" }}
      >
        <img src="/logo.png" alt="TRON" width="300" class={tw`mt-32`} />
        {data !== null && (
          <p class={tw`mt-auto mb-8 text-[#eee]`}>
            今までの勝者 ー <span class={tw`text-yellow-400`}>{data.winner}人</span> /
            {" "}
            {data.battle}人
          </p>
        )}
        <p class={tw`mb-32 text-[#eee]`}>WASDまたは矢印キーを押してスタート</p>
      </div>
    );
  }

  if (state === "playing") {
    return <></>;
  }

  if (["win", "lose"].includes(state)) {
    return (
      <div
        class={tw`w-full h-full flex flex-col items-center animate-fadein`}
        style={{ backgroundColor: "rgb(0 0 0 / 50%)" }}
      >
        <p class={tw`mt-32`}>
          {state === "win" && (
            <span
              class={tw`text-8xl text-yellow-400`}
              style={{ textShadow: "0 0 1rem rgba(250 204 21 / 50%)" }}
            >
              YOU WIN
            </span>
          )}
          {state === "lose" && (
            <span
              class={tw`text-8xl text-red-600`}
              style={{ textShadow: "0 0 1rem rgba(220 38 38 / 50%)" }}
            >
              YOU LOSE
            </span>
          )}
        </p>
        <p class={tw`mb-32 mt-auto text-[#eee]`}>スペースキーを押してリトライ</p>
      </div>
    );
  }

  return <></>;
};

export default BoardScreen;
