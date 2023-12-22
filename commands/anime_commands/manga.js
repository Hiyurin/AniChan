const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manga')
    .setDescription('Tìm kiếm thông tin về một bộ manga.')
    .addStringOption(option => option.setName('name').setDescription('Tên manga cần tìm').setRequired(true)),
  async execute(interaction) {
    const MangaName = interaction.options.getString('name');

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($name: String) {
            Media (search: $name, type: MANGA) {
              id
              siteUrl
              title {
                romaji
              }
              description
              coverImage {
                large
              }
              chapters
              genres
              averageScore
              meanScore
              studios(isMain: true) {
                edges {
                  node {
                    name
                  }
                }
              }
              genres
            }
          }
        `,
        variables: { name: MangaName },
      });

      const MangaData = response.data.data.Media;

      if (!MangaData) {
        return interaction.reply(`Không tìm thấy manga: **${MangaName}**`);
      }

      const MangaGenre = MangaData.genres;
      if (MangaGenre.includes('Ecchi') || MangaGenre.includes('Hentai')) {
       return interaction.reply(`**AniChan đã chặn kết quả tìm kiếm manga: ${MangaName}**\n__Lý do:__ Để bảo vệ máy chủ của bạn khỏi điều khoản dịch vụ của Discord, AniChan chặn các kết quả tìm kiếm chứa nội dung người lớn.`);
      }

      const description = MangaData.description ? MangaData.description.slice(0, 500) + '...' : 'Không có thông tin.';

      const embed = new MessageEmbed()
        .setTitle(MangaData.title.romaji)
        .setURL(MangaData.siteUrl)
        .setDescription(description)
        .addFields(
          {
             name: 'Số chương', 
             value: MangaData.chapters ? Manga.chapters : 'Không xác định', 
             inline: true 
          },
          {
             name: 'Thể loại', 
             value: MangaData.genres.join(', '), 
             inline: true 
          },
          {
             name: 'Xếp hạng',
             value: `${MangaData.averageScore}/100`, 
             inline: true 
          },
          {
             name: 'Đánh giá', 
             value: `${MangaData.meanScore ? MangaData.meanScore + '/100' : 'Không có'}`, 
             inline: true 
          },
        )
        .setImage(MangaData.coverImage.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm manga.');
    }
  },
};
