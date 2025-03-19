const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emojis = require('../emojis');

module.exports = {
    // 슬래쉬커맨드 등록
    data: new SlashCommandBuilder()
        .setName('도움말')
        .setDescription('처니의 여러가지 기능들을 자세하게 알아보아요~!')
        .addStringOption(option =>
            option
                .setName('기능')
                .setDescription('어떤 기능의 도움말이 궁금하신가요?')
                .setRequired(false)
                .addChoices(
                    { name: 'ping', value: 'ping' },
                    { name: '타이머', value: 'timer' }
                )
        ),

    async execute(interaction) {
        const action = interaction.options.getString('기능');
        const chuni = interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 });

        // 도움말
        if (!action) {
            const helpEmbed = new EmbedBuilder()
                .setColor(0xffd651)
                .setTitle('도움말')
                .setDescription('수리중. . .')
                .setThumbnail(chuni)
                .addFields(
                    { name: '> 타이머', value: '디스코드에서 타이머 기능을 사용할 수 있어요!', inline: false }
                )
            
            await interaction.reply({ embeds: [helpEmbed] });
            return;
        }

        // 핑
        if (action === 'ping') {
            const pingEmbed = new EmbedBuilder()
                .setColor(0xffd651)
                .setTitle('🏓 Ping 도움말')
                .setDescription('핑은 도움말이 필요가없어요~ 곧 없어질 도움말이에요~~')
            
            await interaction.reply({ embeds: [pingEmbed] });
            return;
        }

        // 타이머
        if (action === 'timer') {
            const timerEmbed = new EmbedBuilder()
                .setColor(0xffd651)
                .setTitle(`${emojis.clock} 타이머 도움말`)
                .setDescription('디스코드에서 타이머 기능을 사용할 수 있어요!')
                .addFields(
                    { name: `${emojis.hourglass} 타이머 시작`, value: '타이머를 시작해요! 타이머는 1분에 한번씩 업데이트돼요.', inline: false },
                    { name: `${emojis.stop} 타이머 종료`, value: '실행 중인 타이머를 종료해요. 아직은 사용할 수 없는 기능이에요😿', inline: false }
                )

            await interaction.reply({ embeds: [timerEmbed] });
            return;
        }
    },
};