import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import { APIInteraction, InteractionResponseType, InteractionType } from 'discord.js';
import { Interactions } from './interactions';

const router = AutoRouter();

// Load the comamnds and interactions
Interactions.initialize();

router.post('/', async (request, env: Env, ctx: ExecutionContext) => {
  // Verify our request is valid via the signature attached
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  // Process ping/pong
  if (interaction.type === InteractionType.Ping) {
    return Response.json({ type: InteractionResponseType.Pong });
  }

  // Execute across all of our interactions
  const response = Interactions.execute(interaction, env, ctx);
  if (response) {
    return response;
  }

  console.warn('Unhandled interaction', interaction.type, JSON.stringify(interaction.data, null, 2));
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
