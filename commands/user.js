const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Hiển thị thông tin tổng quan về người dùng.')
    .addStringOption(option => option.setName('username').setDescription('Tên người dùng trên AniList').setRequired(true)),
  async execute(interaction) {
    const username = interaction.options.getString('username');

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($username: String) {
            User (name: $username) {
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
        `,
        variables: { username },
      });

      const user = response.data.data.User;

      if (!user) {
        console.log(`Không tìm thấy người dùng: ${username}`);
        return interaction.reply('Không tìm thấy người dùng.');
      }

      console.log(`Thông tin người dùng: ${JSON.stringify(user)}`);

      const embed = new MessageEmbed()
        .setTitle(`${user.name}'s Profile`)
        .setDescription(user.about || 'Không có thông tin.')
        .setThumbnail(user.avatar?.large || '')
        .addField('Số lượng anime đã xem', `${user.statistics.anime?.count || 0} bộ`, true)
        .addField('Thời gian đã xem', `${user.statistics.anime?.minutesWatched || 0} phút`, true)
        .addField(' Số bộ manga đã đọc', `${user.statistics.manga?.count || 0} chương`, true)
        .addField(' Số chương manga đã đọc', `${user.statistics.manga?.chaptersRead || 0} chương`, true)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm người dùng.');
    }
  },
};
