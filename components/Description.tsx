/** @jsx h */
/** @jsxFrag Fragment */
import { ComponentChildren, Fragment, h } from "preact";
import { tw } from "@twind";

type headingProps = {
  children?: ComponentChildren;
};

const Heading = ({ children }: headingProps) => {
  return (
    <h2
      class={tw`text-gray-100 text-lg border-b-2 px-4 py-1 border-gray-100 mt-8 mb-4`}
    >
      {children}
    </h2>
  );
};

type paragraphProps = {
  children?: ComponentChildren;
};

const Paragraph = ({ children }: paragraphProps) => {
  return <p class={tw`text-gray-200`}>{children}</p>;
};

const Description = () => {
  return (
    <>
      <Heading>TRONとは？</Heading>
      <Paragraph>TRONは2人プレイで盤面を動き回り、先に動けなくなった方が負けの対戦ゲームです。</Paragraph>
      <Paragraph>プレイヤーは自分の跡を残しながら動き、跡に触れたら負けです。盤面の外に出ても負けです。</Paragraph>

      <Heading>操作方法</Heading>
      <Paragraph>赤い方がプレイヤーで、WASDまたは矢印キーで操作します</Paragraph>
      <Paragraph>W または ↑ : 上に移動</Paragraph>
      <Paragraph>D または → : 右に移動</Paragraph>
      <Paragraph>S または ↓ : 下に移動</Paragraph>
      <Paragraph>A または ← : 左に移動</Paragraph>
    </>
  );
};

export default Description;
