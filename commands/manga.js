const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manga')
    .setDescription('Tìm kiếm thông tin về một bộ manga.')
    .addStringOption(option => option.setName('name').setDescription('Tên manga cần tìm').setRequired(true)),
  async execute(interaction) {
    const lnName = interaction.options.getString('name');

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($name: String) {
            Media (search: $name, type: MANGA) {
              id
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
            }
          }
        `,
        variables: { name: lnName },
      });

      const lnData = response.data.data.Media;

      if (!lnData) {
        console.log(`Không tìm thấy manga: ${lnName}`);
        return interaction.reply(`Không tìm thấy manga: **${lnName}**`);
      }

      console.log(`Thông tin về manga: ${JSON.stringify(lnData)}`);

      const description = lnData.description ? lnData.description.slice(0, 500) + '...' : 'Không có thông tin.';

      const embed = new MessageEmbed()
        .setTitle(lnData.title.romaji)
        .setDescription(description)
        .addField('Số chương', lnData.chapters ? ln.chapters : 'Không xác định', true)
        .addField('Thể loại', lnData.genres.join(', '), true)
        .addField('Xếp hạng', `${lnData.averageScore}/100`, true)
        .addField('Đánh giá', `${lnData.meanScore ? lnData.meanScore + '/100' : 'Không có'}`, true)
        .setImage(lnData.coverImage.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm manga.');
    }
  },
};
