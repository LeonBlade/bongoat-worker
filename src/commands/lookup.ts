import { APIChatInputApplicationCommandGuildInteraction, MessageFlags, SlashCommandStringOption } from 'discord.js';
import { DiscordCommand } from './command';

export const ids = {
  username: 'username',
};

export class LookupCommand extends DiscordCommand {
  constructor() {
    super('lookup', 'Find out who a Minecraft user is on Discord.');
    this.command.addStringOption(
      new SlashCommandStringOption().setName(ids.username).setDescription('Username of the chatter on Minecraft').setRequired(true),
    );
  }

  protected async doExecute(interaction: APIChatInputApplicationCommandGuildInteraction, env: Env) {
    const name = interaction.data.options?.find((option) => option.name === ids.username);
    const list = await env.WHITELIST.list();
    const found = Object.keys(list).find((key) => key === name?.name);
    return {
      flags: MessageFlags.Ephemeral,
      content: `Minecraft User "${name?.name}" is associated with <@${found}>`,
    };
  }
}
