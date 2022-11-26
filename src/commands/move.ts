import {ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from '.';
import {SlashCommandBuilder} from '@discordjs/builders';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('move')
    .setDescription('대기열 내에서 곡을 이동합니다.')
    .addIntegerOption(option =>
      option.setName('from')
        .setDescription('이동할 곡의 현재 위치')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('to')
        .setDescription('곡을 이동할 위치')
        .setRequired(true));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const from = interaction.options.getInteger('from') ?? 1;
    const to = interaction.options.getInteger('to') ?? 1;

    if (from < 1) {
      throw new Error('위치는 적어도 1 이어야 해요.');
    }

    if (to < 1) {
      throw new Error('위치는 적어도 1 이어야 해요.');
    }

    const {title} = player.move(from, to);

    await interaction.reply('**' + title + '**을(를) **' + String(to) + '**로 이동했어요.');
  }
}
