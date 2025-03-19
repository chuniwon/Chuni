const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'tts',
    },
    async execute(interaction) {
        const Embed = new EmbedBuilder()
            .setColor(0xffd651)
            .setTitle('수리중 . . .')
            .setDescription('얼른 보여드릴 수 있도록 노력할게요!')
    
        await interaction.reply({ embeds: [Embed] });
    },
};