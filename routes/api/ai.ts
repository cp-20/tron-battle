import { Handlers } from '$fresh/server.ts';
import AI from '../../utils/AI.ts';

export const handler: Handlers = {
  POST: async (req) => {
    const body = await req.json();

    const nextDir = AI(body);

    return new Response(nextDir);
  },
};
