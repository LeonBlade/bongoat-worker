import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import { APIInteraction, InteractionResponseType, InteractionType } from 'discord.js';

import { DiscordCommand } from './commands/command';

const router = AutoRouter();

router.post('/', async (request, env: Env) => {
  // Verify our request is valid via the signature attached
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  // Process ping/pong
  if (interaction.type === InteractionType.Ping) {
    return Response.json({ type: InteractionResponseType.Pong });
  }

  // Process commands
  if (interaction.type === InteractionType.ApplicationCommand) {
    const response = DiscordCommand.execute(interaction);
    if (!response) {
      console.warn(`Unhandled interaction: ${interaction.data.name.toLowerCase()}`);
    }
    return response;
  }

  // Process component interactions
  if (interaction.type === InteractionType.MessageComponent) {
    console.log(
      `Interaction fired! User: ${interaction.member}, Component Type: ${interaction.data.component_type}, Component ID: ${interaction.data.custom_id}`,
    );
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
