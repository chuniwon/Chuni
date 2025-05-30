require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.CHUNI;
const CLIENT_ID = process.env.CHUNI_CLIENT;

const commands = [
    // ping
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('처니의 응답 속도를 보여줘요!'),

    // 도움말
    new SlashCommandBuilder()
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

    // 타이머
    new SlashCommandBuilder()
        .setName('타이머')
        .setDescription('타이머 기능을 디스코드에서 사용할 수 있어요!')
        .addStringOption(option =>
            option
                .setName('기능')
                .setDescription('어떤 기능을 사용하고 싶으신가요?')
                .setRequired(true)
                .addChoices(
                    { name: '시작', value: 'start' },
                    { name: '종료', value: 'stop' }
                )
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('등록 중...');

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log('등록 완료');
    } catch (error) {
        console.error(error);
    }
})();