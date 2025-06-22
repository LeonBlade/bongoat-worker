import { ModalBuilder } from 'discord.js';

export abstract class ComponentInteraction {
  protected modal: ModalBuilder;

  constructor() {
    this.modal = new ModalBuilder();
  }
}
