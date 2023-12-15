const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trending')
    .setDescription('Hiển thị danh sách 10 bộ anime đang thịnh hành trên AniList.'),
  async execute(interaction) {
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query {
            Page (perPage: 10) {
              media (sort: TRENDING_DESC, type: ANIME) {
                id
                title {
                  romaji
                }
                description
                coverImage {
                  large
                }
                averageScore
                meanScore
              }
            }
          }
        `,
      });

      const trendingAnime = response.data.data.Page.media;

      console.log('Danh sách trending anime:', trendingAnime);

      const embed = new MessageEmbed()
        .setTitle('Danh sách 10 bộ anime đang thịnh hành trên AniList')
        .setDescription('Dưới đây là danh sách 10 bộ anime đang thịnh hành trên AniList:')
        .setTimestamp();

      trendingAnime.forEach(anime => {
        const description = anime.description ? anime.description.slice(0, 1000) : 'Không có mô tả';

        embed.addField(
          anime.title.romaji,
          `Xếp hạng: ${anime.averageScore}/100\nĐánh giá: ${anime.meanScore ? anime.meanScore + '/100' : 'Không có'}`,
          false
        );

        //   embed.setImage();
      });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm trending anime:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm trending anime.');
    }
  },
};
