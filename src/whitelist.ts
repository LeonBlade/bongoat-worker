import { Rcon } from 'minecraft-rcon-client';

export async function whitelist(username: string, env: Env, remove?: boolean): Promise<{ success: boolean; error?: string }> {
  const client = new Rcon({
    host: env.MINECRAFT_IP,
    port: Number.parseInt(env.MINECRAFT_RCON_PORT),
    password: env.MINECRAFT_RCON_PASSWORD,
  });

  await client.connect();

  // In case we're removing a user instead of adding, we don't really care about the response
  if (remove) {
    await client.query(`whitelist remove ${username}`);
    return { success: true };
  }

  const response = await client.query(`whitelist add ${username}`);
  client.disconnect();

  if (response.toLowerCase() !== `added ${username.toLowerCase()} to the whitelist`) {
    console.error('Error:', response);
    if (response === 'Player is already whitelisted') {
      return { success: false, error: `You're already whitelisted on the server. Having troubles? Pleaes contact one of the moderators.` };
    }
    return { success: false };
  }

  return { success: true };
}
