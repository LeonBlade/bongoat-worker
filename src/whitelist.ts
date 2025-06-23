import { Rcon } from 'minecraft-rcon-client';

export async function whitelist(username: string, env: Env): Promise<{ success: boolean; error?: string }> {
  const client = new Rcon({
    host: env.MINECRAFT_IP,
    port: Number.parseInt(env.MINECRAFT_RCON_PORT),
    password: env.MINECRAFT_RCON_PASSWORD,
  });

  await client.connect();
  const response = await client.query(`whitelist add ${username}`);
  client.disconnect();

  if (!response.startsWith('Added')) {
    console.error(response);
    if (response === 'Player is already whitelisted') {
      return { success: false, error: `You're already whitelisted on the server. Having troubles? Pleaes contact one of the moderators.` };
    }
    return { success: false };
  }

  return { success: true };
}
