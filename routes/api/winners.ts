import { Handlers } from '$fresh/server.ts';

export type winnerFile = {
  winner: number;
};

const WINNER_FILE_PATH = './winners.json';

export const handler: Handlers = {
  GET: () => {
    const text = Deno.readTextFileSync(WINNER_FILE_PATH);
    return new Response(text);
  },
  POST: () => {
    const text = Deno.readTextFileSync(WINNER_FILE_PATH);
    const content = JSON.parse(text) as winnerFile;
    Deno.writeTextFileSync(
      WINNER_FILE_PATH,
      JSON.stringify({ winner: content.winner + 1 })
    );
    return new Response();
  },
};
