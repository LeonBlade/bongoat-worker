import dotenvx from '@dotenvx/dotenvx';

import { APIApplicationCommandInteraction, InteractionType, REST, RESTPutAPIApplicationGuildCommandsJSONBody, Routes } from 'discord.js';

import { Interactions } from './interactions';
import { DiscordCommand } from './commands';

dotenvx.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}

if (!applicationId) {
  throw new Error('The DISCORD_APPLICATION_ID variable is required.');
}

if (!guildId) {
  throw new Error('The DISCORD_GUILD_ID variable is required.');
}

const rest = new REST({ version: '10' }).setToken(token);

try {
  // Init the interactions
  Interactions.initialize();
  // Get comands from the interactions
  const commands = Interactions.get<APIApplicationCommandInteraction>(InteractionType.ApplicationCommand);

  // Register the command with the guild
  await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
    body: commands?.map((command) => (command as DiscordCommand).getBuilder().toJSON()) as RESTPutAPIApplicationGuildCommandsJSONBody,
  });
} catch (error) {
  console.error(error);
}
