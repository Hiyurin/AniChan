const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Hiển thị thông tin tổng quan về người dùng trên AniList.')
    .addStringOption(option => option.setName('username').setDescription('Tên người dùng trên AniList').setRequired(true)),
  async execute(interaction) {
    const username = interaction.options.getString('username');

    try {
      const query = `
        query ($username: String) {
          User(name: $username) {
            id
            name
            about
            avatar {
              large
            }
            statistics {
              anime {
                count
                minutesWatched
              }
              manga {
                count
                chaptersRead
              }
            }
          }
        }
      `;

      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { username },
      });

      const userData = response.data.data.User;

      if (!userData) {
        console.log(`Không tìm thấy thông tin người dùng: ${username}`);
        return interaction.reply(`Không tìm thấy thông tin người dùng: **${username}**`);
      }

      console.log(`Thông tin người dùng: ${JSON.stringify(userData)}`);

      const embed = new MessageEmbed()
        .setTitle(userData.name)
        .setColor('#C6FFFF')
        .addFields(
          {
            name: 'Số lượng anime đã xem',
            value: `${userData.statistics.anime.count} bộ.`,
            inline: true,
          },
          {
            name: 'Thời gian anime đã xem',
            value: `${userData.statistics.anime.minutesWatched} phút.`,
            inline: true,
          },
          {
            name: 'Số lượng manga đã đọc',
            value: `${userData.statistics.manga.count} bộ.`,
            inline: true,
          },
          {
            name: 'Số lượng chương manga đã đọc',
            value: `${userData.statistics.manga.chaptersRead} chương.`,
            inline: true,
          }
        )
        .setThumbnail(userData.avatar.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      interaction.reply('Đã xảy ra lỗi khi lấy thông tin người dùng.');
    }
  },
};
