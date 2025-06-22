import {
  APIApplicationCommandInteraction,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  SlashCommandBuilder,
} from 'discord.js';

export abstract class DiscordCommand {
  private static commands: Map<string, DiscordCommand> = new Map();

  protected command: SlashCommandBuilder;

  constructor(name: string, description?: string) {
    this.command = new SlashCommandBuilder().setName(name);
    if (description) {
      this.command.setDescription(description);
    }

    // Add self to the command list
    DiscordCommand.addCommand(this);
  }

  public getName(): string {
    return this.command.name.toLowerCase();
  }

  public async execute(interaction?: APIApplicationCommandInteraction): Promise<Response> {
    const data = this.doExecute(interaction);

    return Response.json({
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    });
  }

  protected abstract doExecute(interaction?: APIApplicationCommandInteraction): Partial<APIInteractionResponseCallbackData>;

  // Static method to add command to the list
  private static addCommand(command: DiscordCommand) {
    const name = command.getName()?.toLowerCase();
    if (!name) {
      throw new Error(`Couldn't add command, name required: ${command}`);
    }

    // Don't allow for existing names to conflict
    if (DiscordCommand.commands.has(name)) {
      throw new Error(`Command with name ${name} already exists!`);
    }

    // Add command to the commands map
    DiscordCommand.commands.set(typeof command, command);

    console.log(`Added command ${typeof command}!`);
  }

  public static getCommands(): typeof DiscordCommand.commands {
    return { ...DiscordCommand.commands };
  }

  public static execute(interaction: APIApplicationCommandInteraction): Promise<Response> | undefined {
    const name = interaction.data.name.toLowerCase();
    return DiscordCommand.commands.get(name)?.execute(interaction);
  }
}
