import {
  APIApplicationCommandInteraction,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  InteractionType,
  SlashCommandBuilder,
} from 'discord.js';

import { InteractionExecute, Interactions } from '../interactions';

export abstract class DiscordCommand implements InteractionExecute<APIApplicationCommandInteraction> {
  protected command: SlashCommandBuilder;

  constructor(name?: string, description?: string) {
    this.command = new SlashCommandBuilder();

    if (name) {
      this.command.setName(name);
    }
    if (description) {
      this.command.setDescription(description);
    }

    Interactions.add(InteractionType.ApplicationCommand, this);
  }

  public getBuilder(): SlashCommandBuilder {
    return this.command;
  }

  protected abstract doExecute(interaction?: APIApplicationCommandInteraction): Partial<APIInteractionResponseCallbackData>;

  public predicate(interaction: APIApplicationCommandInteraction) {
    return interaction.data.name === this.command.name;
  }

  public async execute(interaction: APIApplicationCommandInteraction): Promise<Response> {
    const data = this.doExecute(interaction);

    return Response.json({
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    });
  }
}
