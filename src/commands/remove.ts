import {ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from '.';
import {SlashCommandBuilder} from '@discordjs/builders';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('대기열에서 곡을 제거합니다.')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('제거할 곡의 위치 [기본값: 1]')
        .setRequired(false),
    )
    .addIntegerOption(option =>
      option.setName('range')
        .setDescription('제거할 곡의 수 [기본값: 1]')
        .setRequired(false));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const position = interaction.options.getInteger('position') ?? 1;
    const range = interaction.options.getInteger('range') ?? 1;

    if (position < 1) {
      throw new Error('위치는 적어도 1 이어야 해요.');
    }

    if (range < 1) {
      throw new Error('위치는 적어도 1 이어야 해요.');
    }

    player.removeFromQueue(position, range);

    await interaction.reply(':wastebasket: 제거했어요.');
  }
}
