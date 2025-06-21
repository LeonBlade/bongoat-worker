import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import { APIInteraction, InteractionResponseType, InteractionType } from 'discord.js';

import { command, execute } from './commands';

const router = AutoRouter();

router.post('/', async (request, env: Env) => {
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.Ping) {
    return Response.json({ type: InteractionResponseType.Pong });
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    switch (interaction.data.name.toLowerCase()) {
      case command.name.toLowerCase(): {
        // Execute our command!
        return execute();
        break;
      }
    }
  }
});

async function verifyDiscordRequest(request: Request, env: Env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body) as APIInteraction, isValid: true };
}

export default {
  fetch: router.fetch,
} satisfies ExportedHandler<Env>;
