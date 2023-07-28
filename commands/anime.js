const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Tìm kiếm thông tin về một bộ anime cụ thể.')
    .addStringOption(option => option.setName('name').setDescription('Tên của anime cần tìm').setRequired(true)),
  async execute(interaction) {
    const animeName = interaction.options.getString('name');

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($name: String) {
            Media (search: $name, type: ANIME) {
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
        `,
        variables: { name: animeName },
      });

      const animeData = response.data.data.Media;

      if (!animeData) {
        console.log(`Không tìm thấy anime: ${animeName}`);
        return interaction.reply(`Không tìm thấy anime: **${animeName}**`);
      }

      console.log(`Thông tin anime: ${JSON.stringify(animeData)}`);

      const description = animeData.description ? animeData.description.slice(0, 500) + '...' : 'Không có thông tin.';

      const embed = new MessageEmbed()
        .setTitle(animeData.title.romaji)
        .setDescription(description)
        .addField('Xếp hạng', `${animeData.averageScore}/100`, true)
        .addField('Đánh giá', `${animeData.meanScore ? animeData.meanScore + '/100' : 'Không có'}`, true)
        .setImage(animeData.coverImage.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm anime:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm anime.');
    }
  },
};
