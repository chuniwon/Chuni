const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('입장')
        .setDescription('원하는 음성채널에 처니를 불러주세요~!')
        .addStringOption(option => 
            option.setName('채널')
                .setDescription('처니가 어디로 들어가면 될까요?')
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
    
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: true
            });
    
            await interaction.reply({ 
                content: `✅ '${channelName}' 채널에 입장했습니다!`, 
                flags: MessageFlags.Ephemeral 
            });
        }
};