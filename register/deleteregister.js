require('dotenv').config();

const { REST, Routes } = require('discord.js');

const TOKEN = process.env.CHUNI;
const CLIENT_ID = process.env.CHUNI_CLIENT;

// 삭제할 슬래시커맨드 ID 입력하기
const COMMAND_ID = '1339989844654293094';

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.delete(Routes.applicationCommand(CLIENT_ID, COMMAND_ID));
        console.log(`삭제 완료: ${COMMAND_ID}`);
    } catch (error) {
        console.error(error);
    }
})();