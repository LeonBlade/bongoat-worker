import {
  ActionRowBuilder,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIModalSubmitInteraction,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  REST,
  Routes,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { DiscordComponent } from './component';

import { ids as embedIds } from '../commands/embed';
import { InteractionExecute, Interactions } from '../interactions';
import { whitelist } from '../whitelist';

export const ids = {
  textBox: 'mc-username',
  modal: embedIds.embed,
};

export class WhitelistModal extends DiscordComponent {
  private modal: ModalBuilder;

  constructor() {
    super();

    const textBox = new TextInputBuilder()
      .setCustomId(ids.textBox)
      .setLabel('Minecraft Username')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textBox);

    this.modal = new ModalBuilder().setCustomId(ids.modal).setTitle('Join the Minecraft Server!').addComponents(actionRow);
  }

  protected getCustomId() {
    return this.modal.data.custom_id;
  }

  public doExecute() {
    return this.modal.toJSON();
  }
}

export class WhitelistModalResponse implements InteractionExecute<APIModalSubmitInteraction> {
  constructor() {
    Interactions.add(InteractionType.ModalSubmit, this);
  }

  execute(interaction: APIModalSubmitInteraction, env: Env, ctx: ExecutionContext) {
    // We are just hard coding the index as 0 as we know the shape of the data that's coming back
    const textBox = interaction.data.components[0].components[0];

    // Keep this worker alive past the response
    ctx.waitUntil(this.verifyUser(interaction, textBox.value, env));

    // Defer out a message so we can process the user safely
    return Response.json({
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
      },
    } satisfies APIInteractionResponseDeferredChannelMessageWithSource);
  }

  async verifyUser(interaction: APIModalSubmitInteraction, username: string, env: Env) {
    // Create Discord REST client to update deferred message and perform other actions
    const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

    // Update the deferred message to the content provided
    const updateDeferred = async (content: string) =>
      rest.patch(Routes.webhookMessage(env.DISCORD_APPLICATION_ID, interaction.token, '@original'), {
        body: {
          content,
        },
      });

    if (!interaction.member) {
      console.error('Member/User not found on interaction. This should not happen!', interaction);
      updateDeferred(`An unknown error has occured. Please contact one of the moderators.`);
      return;
    }

    // Calculate the difference of the join date and today
    const daysInMs = 1000 * 60 * 60 * 24;
    const difference = new Date().getTime() - new Date(interaction.member.joined_at).getTime();
    const days = Math.floor(difference / daysInMs);

    // Not allowed in the server
    if (days < 10) {
      return updateDeferred(
        `Thank you for your interest. Unfortuantely, we cannot add you to the server at this time. If you feel there's been a mistake, please reach out to one of the moderators.`,
      );
    }

    // RCON the whitelist command to the server
    const status = await whitelist(username, env);
    if (!status.success) {
      return updateDeferred(
        status.error ||
          `We're unable to whitelist any user with this name. Please check your Minecraft username again. If this error continues to occur, please contact one of the moderators.`,
      );
    }

    try {
      await rest.put(Routes.guildMemberRole(env.DISCORD_GUILD_ID, interaction.member.user?.id, env.DISCORD_WHITELISTED_ROLE));
    } catch {
      return updateDeferred(
        `Whitelist was partially unsuccessful. Role was not added successfully. Please reach out to a moderator for assistance.`,
      );
    }

    // Update the deferred message
    updateDeferred(`You've been successfully whitelisted to the server!`);
  }

  predicate(interaction: APIModalSubmitInteraction) {
    return interaction.data.custom_id === ids.modal;
  }
}
