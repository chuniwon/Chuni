require('dotenv').config();

const { Client, GatewayIntentBits, Events, ActivityType, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const emojis = require('./emojis');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// 봇 시작
client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} 시작 (${new Date().toLocaleString()})`);
    client.user.setStatus('online');

    client.user.setPresence({
        activities: [{ name: `/도움말`, type: ActivityType.Listening }],
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (client.commands.has(commandName)) {
        const command = client.commands.get(commandName);
        await command.execute(interaction);
    }
});

client.login(process.env.CHUNI);

// branch test