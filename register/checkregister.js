require('dotenv').config();

const { REST, Routes } = require('discord.js');

const TOKEN = process.env.CHUNI;
const CLIENT_ID = process.env.CHUNI_CLIENT;

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        const commands = await rest.get(Routes.applicationCommands(CLIENT_ID));

        commands.forEach(command => {
            console.log(`ID: ${command.id}, 명령어: /${command.name}`);
        });
    } catch (error) {
        console.error(error);
    }
})();