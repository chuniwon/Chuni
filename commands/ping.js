module.exports = {
    data: {
        name: 'ping',
    },
    async execute(interaction) {
        const ping = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`🏓 Pong! **${ping}ms** 걸렸네요!`);
    },
};