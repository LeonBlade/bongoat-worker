import {
  ActionRowBuilder,
  APIInteractionResponseCallbackData,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageActionRowComponentBuilder,
  MessageFlags,
  TextDisplayBuilder,
} from 'discord.js';
import { DiscordCommand } from './command';

export const ids = {
  embed: 'whitelist',
};

export class EmbedCommand extends DiscordCommand {
  constructor() {
    super('embed', 'Creates the whitelist message and button.');
  }

  public doExecute(): APIInteractionResponseCallbackData {
    const markdown = new TextDisplayBuilder().setContent(`
## Join Yuchi's Minecraft Server

Before you join, make sure you **read the rules**! Once you've read the rules, you can click on the button below to gain access to the server.

In order to join, make sure you have your Minecraft username ready to go. Don't know what it is? Head on over to the [Minecraft website](https://www.minecraft.net/msaprofile/mygames/editprofile) and log in.

You should be able to see your "Java Profile Name". This is what you'll enter in to gain access to the server! You can also change it from this page if you want.

Ready to join? Click the button below and fill in your username!

Need help? Reach out to <@59388399135498240> or another <@&817308020962230272> for assistance.`);

    const joinButton = new ButtonBuilder().setCustomId(ids.embed).setLabel('Join Server').setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(joinButton);

    const component = new ContainerBuilder().setAccentColor(0x9ac2ff).addTextDisplayComponents(markdown).addActionRowComponents(actionRow);

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [component.toJSON()],
    };
  }
}
