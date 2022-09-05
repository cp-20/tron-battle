import { Handlers } from '$fresh/server.ts';

export type winnerFile = {
  winner: number;
  battle: number;
};

const WINNER_FILE_PATH = './winners.json';

// TODO: 試合数を表示する

export const handler: Handlers = {
  GET: () => {
    const text = Deno.readTextFileSync(WINNER_FILE_PATH);
    return new Response(text);
  },
  POST: (req) => {
    const url = new URL(req.url);
    const isWinner = url.search.indexOf('type=winner') !== -1;

    const text = Deno.readTextFileSync(WINNER_FILE_PATH);
    const content = JSON.parse(text) as winnerFile;
    const newContent: winnerFile = {
      winner: content.winner + Number(isWinner),
      battle: content.battle + 1,
    };
    Deno.writeTextFileSync(WINNER_FILE_PATH, JSON.stringify(newContent));
    return new Response();
  },
};
