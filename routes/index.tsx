/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import PlayBoard from "../islands/PlayBoard.tsx";
import Description from "../components/Description.tsx";

const Home = () => {
  return (
    <>
      <h1 class={tw`hidden`}>TRON</h1>

      <div
        class={tw`min-h-screen bg-[#2e4a41]`}
        style={{
          backgroundImage:
            "linear-gradient(#233731 1px, transparent 1px), linear-gradient(to right, #233731 1px, #2e4a41 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div class={tw`flex p-8 space-x-8`}>
          <div class={tw``}>
            <div class={tw``} style={{ boxShadow: "0 0 1rem rgba(0,0,0,0.5)" }}>
              <PlayBoard />
            </div>
          </div>
          <div class={tw`flex-1`}>
            <Description />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
