import { Handlers } from '$fresh/server.ts';
import init, { ai_response } from '../../utils/ai/wasm.js';

if (Deno.env.get('ENVIRONMENT') === 'production') {
  const res = await fetch(
    'https://github.com/cp-20/tron-battle/blob/feature/turn/static/wasm_bg.wasm?raw=true'
  );
  await init(await res.arrayBuffer());
} else {
  await init(Deno.readFile('./static/wasm_bg.wasm'));
}

export const handler: Handlers = {
  POST: async (req) => {
    try {
      const res = ai_response(await req.text());
      const direction = res.toLowerCase().slice(1, -1);

      return new Response(direction);
    } catch (err) {
      console.error(err);

      return new Response('up');
    }
  },
};
