const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('퇴장')
        .setDescription('처니를 내쫓으시는 거예요~?!')
        .addStringOption(option =>
            option.setName('채널')
                .setDescription('어느 채널에서 나갸아 하나요?ㅠㅠ')
                .setRequired(true)
        ),

    async execute(interaction) {
        const channelName = interaction.options.getString('채널');
        const voiceChannel = interaction.guild.channels.cache.find(channel =>
            channel.isVoiceBased() && channel.name === channelName
        );

        if (!voiceChannel) {
            return interaction.reply({ content: `🔴 '${channelName}' 채널을 찾을 수 없습니다.`, ephemeral: true });
        }

        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ content: '🔴 봇이 현재 음성 채널에 연결되어 있지 않습니다.', ephemeral: true });
        }

        connection.destroy();

        await interaction.reply({ 
            content: `✅ '${channelName}' 채널에서 퇴장했습니다!`, 
            flags: MessageFlags.Ephemeral 
        });
    }
};