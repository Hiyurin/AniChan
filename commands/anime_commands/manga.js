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
        .setURL(lnData.siteUrl)
        .setDescription(description)
        .addFields(
          {
             name: 'Số chương', 
             value: lnData.chapters ? ln.chapters : 'Không xác định', 
             inline: true 
          },
          {
             name: 'Thể loại', 
             value: lnData.genres.join(', '), 
             inline: true 
          },
          {
             name: 'Xếp hạng',
             value: `${lnData.averageScore}/100`, 
             inline: true 
          },
          {
             name: 'Đánh giá', 
             value: `${lnData.meanScore ? lnData.meanScore + '/100' : 'Không có'}`, 
             inline: true 
          },
        )
        .setImage(lnData.coverImage.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm manga.');
    }
  },
};
