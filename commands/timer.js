const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../db.js');
const emojis = require('../emojis');

// 시간대 설정 (한국)
const moment = require('moment-timezone');
const koreaTime = moment.tz("Asia/Seoul").format('YYYY-MM-DD HH:mm:ss');

let activeTimers = {};

module.exports = {
    data: new SlashCommandBuilder()
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
        ),

    async execute(interaction) {
        const action = interaction.options.getString('기능');
        const userId = interaction.user.id;
        const displayName = interaction.member.displayName;
        const profilePicture = interaction.user.displayAvatarURL({ dynamic: true });
    
        // 타이머 종료
        async function stopTimer(userId, interaction) {
            if (!activeTimers[userId]) {
                return interaction.editReply({
                    content: '종료할 타이머를 발견하지 못했어요😿',
                    ephemeral: true,
                });
            }
        
            const elapsedSeconds = Math.floor((Date.now() - activeTimers[userId].startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
        
            db.run(
                `INSERT INTO users (user_id, total_time) VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET total_time = total_time + ?`,
                [userId, minutes, minutes],
                (err) => {
                    if (err) console.error('데이터베이스 업데이트 오류:', err);
                }
            );
        
            const embed = new EmbedBuilder()
                .setTitle(`${emojis.clock} 타이머 끝! ${minutes}분 지났어요!`)
                .setDescription(`\`Started by ${displayName}\``)
                .addFields(
                    { name: `시작 시간`, value: moment(activeTimers[userId].startTime).tz("Asia/Seoul").format('HH시 mm분'), inline: true },
                    { name: `종료 시간`, value: moment().tz("Asia/Seoul").format('HH시 mm분'), inline: true }
                );
        
            await interaction.editReply({
                embeds: [embed],
                components: [],
            });
        
            delete activeTimers[userId];
        }

        // 타이머 시작
        if (action === 'start') {
            if (activeTimers[userId]) {
                return interaction.reply({
                    content: `아직 실행중인 타이머가 있어요😿 타이머는 동시에 한 가지만 측정 가능해요.`,
                    ephemeral: true,
                });
            }

            activeTimers[userId] = {
                interval: null,
                startTime: Date.now(),
                elapsedTime: 0,
                isPaused: false,
            };

            // 시작 임베드
            const embed = new EmbedBuilder()
                .setTitle(`${emojis.hourglass} 0분...`)
                .setDescription(`\`Started by ${displayName}\``)
                .setColor(0xffd651)
                .setThumbnail(profilePicture)
                .addFields(
                    { 
                        name: `시작 시간`, 
                        value: `${moment.tz(activeTimers[userId].startTime, "Asia/Seoul").format('HH시 mm분')}`, 
                        inline: true 
                    }
                );

            const pauseButton = new ButtonBuilder()
                .setCustomId('pause_timer')
                .setLabel('❚❚')
                .setStyle(ButtonStyle.Primary);

            const stopButton = new ButtonBuilder()
                .setCustomId('stop_timer')
                .setLabel('■')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(pauseButton, stopButton);

            await interaction.reply({
                embeds: [embed],
                components: [row],
            });

            const timerMessage = await interaction.fetchReply();
            const filter = (i) => i.user.id === userId;
            const collector = timerMessage.createMessageComponentCollector({
                filter,
                time: 86400000,
            });

            // 타이머 진행 인터벌
            activeTimers[userId].interval = setInterval(async () => {
                if (!activeTimers[userId].isPaused) {
                    activeTimers[userId].elapsedTime = Date.now() - activeTimers[userId].startTime;

                    const elapsedSeconds = Math.floor(activeTimers[userId].elapsedTime / 1000);
                    const minutes = Math.floor(elapsedSeconds / 60);

                    const timeString = `${minutes}분`;

                    // 진행중 임베드
                    embed.setTitle(`${emojis.hourglass} ${timeString}...`);
                    await timerMessage.edit({
                        embeds: [embed],
                    });
                }
            }, 60000); // 1분마다 업데이트

            // 버튼 클릭 처리
            collector.on('collect', async (buttonInteraction) => {
                try {
                    // 버튼 상호작용을 처리 중임을 알림 (응답 전송)
                    await buttonInteraction.deferUpdate();
            
                    if (buttonInteraction.customId === 'pause_timer') {
                        if (activeTimers[userId].isPaused) {
                            // 타이머 다시 시작
                            activeTimers[userId].isPaused = false;
                            activeTimers[userId].startTime = Date.now() - activeTimers[userId].elapsedTime;

                            // 타이머가 바로 업데이트 되도록 하기
                            const elapsedSeconds = Math.floor(activeTimers[userId].elapsedTime / 1000);
                            const minutes = Math.floor(elapsedSeconds / 60);

                            const timeString = `${minutes}분`;
                            embed.setTitle(`${emojis.hourglass} ${timeString}...`);

                            // 임베드를 즉시 갱신
                            await timerMessage.edit({ embeds: [embed] });

                            pauseButton.setLabel('❚❚').setStyle(ButtonStyle.Primary);
            
                            activeTimers[userId].interval = setInterval(async () => {
                                if (!activeTimers[userId].isPaused) {
                                    activeTimers[userId].elapsedTime = Date.now() - activeTimers[userId].startTime;
            
                                    const elapsedSeconds = Math.floor(activeTimers[userId].elapsedTime / 1000);
                                    const minutes = Math.floor(elapsedSeconds / 60);
            
                                    const timeString = `${minutes}분`;
            
                                    embed.setTitle(`${emojis.hourglass} ${timeString}...`);
                                    await timerMessage.edit({ embeds: [embed] });
                                }
                            }, 60000); // 1분마다 업데이트
                        } else {
                            clearInterval(activeTimers[userId].interval);
                            activeTimers[userId].isPaused = true;
            
                            pauseButton.setLabel('▶').setStyle(ButtonStyle.Success);
            
                            const elapsedSeconds = Math.floor(activeTimers[userId].elapsedTime / 1000);
                            const minutes = Math.floor(elapsedSeconds / 60);
            
                            const timeString = `${minutes}분`;
            
                            embed.setTitle(`${emojis.pause} 타이머가 일시정지 중이에요!`)
                                .setFields(
                                    { name: `시작 시간`, value: `${moment.tz(activeTimers[userId].startTime, "Asia/Seoul").format('HH시 mm분')}`, inline: true },
                                    { name: '랩', value: `${timeString}`, inline: true }
                                );
            
                            await timerMessage.edit({
                                embeds: [embed],
                                components: [new ActionRowBuilder().addComponents(pauseButton, stopButton)],
                            });
                        }
            
                        await timerMessage.edit({
                            components: [new ActionRowBuilder().addComponents(pauseButton, stopButton)],
                        });

                    } else if (buttonInteraction.customId === 'stop_timer') {
                        await stopTimer(userId, interaction);
                    }
                } catch (error) {
                    console.error('버튼 상호작용 처리 중 오류 발생:', error);
                }
            });
            
            collector.on('end', async () => {
                if (activeTimers[userId]) {
                    clearInterval(activeTimers[userId].interval);
                    delete activeTimers[userId];
                }
            
                await timerMessage.edit({
                    components: [],
                });
            });
        }

        // 타이머 종료
        else if (action === 'stop') {
            await interaction.deferReply({ ephemeral: true }); // 응답을 지연시킴

            try {
                await stopTimer(userId, interaction); // 타이머 종료 처리
            } catch (error) {
                console.error("타이머 종료 중 오류 발생:", error);
                await interaction.editReply({
                    content: '타이머 종료 중 오류가 발생했습니다. 다시 시도해 주세요.',
                    ephemeral: true,
                });
            }
        }
    },
};