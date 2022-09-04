import { Handlers } from '$fresh/server.ts';

const API_URL = `http://localhost:6583`;

export const handler: Handlers = {
  POST: async (req) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: await req.text(),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const rawDirection = await res.text();
      const direction = rawDirection.toLowerCase().slice(1, -1);

      return new Response(direction);
    } catch (err) {
      console.error(err);

      return new Response('up');
    }
  },
};
