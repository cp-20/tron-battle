import { Handlers } from '$fresh/server.ts';

export const handler: Handlers = {
  POST: async (req) => {
    const body = await req.json();

    return new Response('right');
  },
};
