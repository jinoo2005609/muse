import {SlashCommandBuilder} from '@discordjs/builders';
import {ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits} from 'discord.js';
import {injectable} from 'inversify';
import {prisma} from '../utils/db.js';
import Command from './index.js';
import {getGuildSettings} from '../utils/get-guild-settings';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('config')
    .setDescription('봇을 설정합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addSubcommand(subcommand => subcommand
      .setName('set-playlist-limit')
      .setDescription('재생목록에서 추가할 수 있는 최대 곡 수를 설정합니다.')
      .addIntegerOption(option => option
        .setName('limit')
        .setDescription('최대 곡 수')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-wait-after-queue-empties')
      .setDescription('대기열이 비어 있을 때 언제 음성 채널을 떠날지 설정합니다.')
      .addIntegerOption(option => option
        .setName('delay')
        .setDescription('딜레이할 시간, 단위는 초 (0으로 설정하면 떠나지 않습니다)')
        .setRequired(true)
        .setMinValue(0)))
    .addSubcommand(subcommand => subcommand
      .setName('set-leave-if-no-listeners')
      .setDescription('다른 사람들이 모두 떠날 때 봇도 떠날지 설정합니다.')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('다른 사람이 떠날 때 봇도 떠날지')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('get')
      .setDescription('모든 설정을 보여줍니다.'));

  async execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case 'set-playlist-limit': {
        const limit: number = interaction.options.getInteger('limit')!;

        if (limit < 1) {
          throw new Error('잘못된 제한');
        }

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            playlistLimit: limit,
          },
        });

        await interaction.reply('👍 제한이 변경되었어요.');

        break;
      }

      case 'set-wait-after-queue-empties': {
        const delay = interaction.options.getInteger('delay')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            secondsToWaitAfterQueueEmpties: delay,
          },
        });

        await interaction.reply('👍 딜레이 시간이 변경되었어요.');

        break;
      }

      case 'set-leave-if-no-listeners': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            leaveIfNoListeners: value,
          },
        });

        await interaction.reply('👍 설정이 변경되었어요.');

        break;
      }

      case 'get': {
        const embed = new EmbedBuilder().setTitle('설정');

        const config = await getGuildSettings(interaction.guild!.id);

        const settingsToShow = {
          '재생목록 제한': config.playlistLimit,
          '대기열이 비었을 때 떠나기까지 기다릴 시간': config.secondsToWaitAfterQueueEmpties === 0
            ? '떠나지 않음'
            : `${config.secondsToWaitAfterQueueEmpties}s`,
          '사람이 없을 때 떠날지 말지': config.leaveIfNoListeners ? 'yes' : 'no',
        };

        let description = '';
        for (const [key, value] of Object.entries(settingsToShow)) {
          description += `**${key}**: ${value}\n`;
        }

        embed.setDescription(description);

        await interaction.reply({embeds: [embed]});

        break;
      }

      default:
        throw new Error('알 수 없는 명령어');
    }
  }
}
