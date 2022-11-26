import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from '.';
import {prettyTime} from '../utils/time.js';
import durationStringToSeconds from '../utils/duration-string-to-seconds.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('fseek')
    .setDescription('현재 곡을 앞으로 탐색합니다.')
    .addStringOption(option => option
      .setName('time')
      .setDescription('간격 표현식 또는 시간(초 단위) (1m, 30s, 100)')
      .setRequired(true));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error('아무것도 재생 중이지 않아요.');
    }

    if (currentSong.isLive) {
      throw new Error('라이브 스트림은 탐색할 수 없어요.');
    }

    const seekValue = interaction.options.getString('time');

    if (!seekValue) {
      throw new Error('잘못된 값');
    }

    const seekTime = durationStringToSeconds(seekValue);

    if (seekTime + player.getPosition() > currentSong.length) {
      throw new Error('곡의 끝부분을 지나서 탐색할 수는 없어요.');
    }

    await Promise.all([
      player.forwardSeek(seekTime),
      interaction.deferReply(),
    ]);

    await interaction.editReply(`👍 ${prettyTime(player.getPosition())}로 이동했어요.`);
  }
}
