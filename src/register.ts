import dotenvx from '@dotenvx/dotenvx';

import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from 'discord.js';

import { command } from './commands';

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
  // Register the command with the guild
  await rest.post(Routes.applicationGuildCommands(applicationId, guildId), {
    body: command.toJSON() satisfies RESTPostAPIApplicationGuildCommandsJSONBody,
  });
} catch (error) {
  console.error(error);
}
