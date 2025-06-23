import { APIInteraction, InteractionType } from 'discord.js';

import { commands } from './commands';
import { components } from './components';

type ResponseReturn = Promise<Response> | Response | undefined;
type ExecuteFn<T extends APIInteraction> = (interaction: T, env: Env, ctx: ExecutionContext) => ResponseReturn;

export interface InteractionExecute<T extends APIInteraction> {
  execute: ExecuteFn<T>;
  predicate: (interaction: T) => boolean;
}

export class Interactions {
  private static interactions: Map<InteractionType, InteractionExecute<APIInteraction>[]> = new Map();

  public static initialize() {
    Object.values(commands).forEach((command) => new command());
    Object.values(components).forEach((component) => new component());
  }

  public static add<T extends APIInteraction>(type: InteractionType, interaction: InteractionExecute<T>) {
    this.interactions.set(type, [...(this.interactions.get(type) || []), interaction as InteractionExecute<APIInteraction>]);
  }

  public static get<T extends APIInteraction>(type: InteractionType) {
    return this.interactions.get(type) as InteractionExecute<T>[] | undefined;
  }

  public static execute<T extends APIInteraction>(interaction: T, env: Env, ctx: ExecutionContext): ResponseReturn {
    return this.interactions
      .get(interaction.type)
      ?.find((i) => i.predicate(interaction))
      ?.execute(interaction, env, ctx);
  }
}
