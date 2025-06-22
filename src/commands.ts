import {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  InteractionResponseType,
  MessageFlags,
  APIInteractionResponse,
  ButtonStyle,
} from 'discord.js';

export const command = new SlashCommandBuilder().setName('embed').setDescription('Creates the whitelist embed.');

const markdown = new TextDisplayBuilder().setContent(`
## Join Yuchi's Minecraft Server

Before you join, make sure you **read the rules**! Once you've read the rules, you can click on the button below to gain access to the server.

In order to join, make sure you have your Minecraft username ready to go. Don't know what it is? Head on over to the [Minecraft website](https://www.minecraft.net/msaprofile/mygames/editprofile) and log in.

You should be able to see your "Java Profile Name". This is what you'll enter in to gain access to the server! You can also change it from this page if you want.

Ready to join? Click the button below and fill in your username!

Need help? Reach out to <@59388399135498240> or another <@&817308020962230272> for assistance.`);

const joinButton = new ButtonBuilder().setCustomId('whitelist').setLabel('Join Server').setStyle(ButtonStyle.Primary);

const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(joinButton);

export const component = new ContainerBuilder()
  .setAccentColor(0x00ddff)
  .addTextDisplayComponents(markdown)
  .addActionRowComponents(actionRow);

export async function execute(): Promise<Response> {
  // Construct the ephameral response, we need to PATCH it later with the components
  const response = Response.json({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.IsComponentsV2,
      components: [component.toJSON()],
    },
  } as APIInteractionResponse);

  return response;
}

export default {
  command,
  execute,
};
