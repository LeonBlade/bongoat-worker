import {
  APIInteractionResponse,
  APIMessageComponentInteraction,
  APIModalInteractionResponseCallbackData,
  InteractionResponseType,
  InteractionType,
} from 'discord.js';

import { InteractionExecute, Interactions } from '../interactions';

export abstract class DiscordComponent implements InteractionExecute<APIMessageComponentInteraction> {
  constructor() {
    Interactions.add(InteractionType.MessageComponent, this);
  }

  protected abstract doExecute(): APIModalInteractionResponseCallbackData;

  protected abstract getCustomId(): string | undefined;

  public predicate(interaction: APIMessageComponentInteraction) {
    return interaction.data.custom_id === this.getCustomId();
  }

  public async execute(): Promise<Response> {
    return Response.json({
      type: InteractionResponseType.Modal,
      data: this.doExecute(),
    } satisfies APIInteractionResponse);
  }
}
