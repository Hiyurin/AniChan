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
              format
              episodes
              status
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              season
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
        variables: { name: animeName },
      });

      const animeData = response.data.data.Media;

      if (!animeData) {
        console.log(`Không tìm thấy anime: ${animeName}`);
        return interaction.reply(`Không tìm thấy anime: **${animeName}**`);
      }

      console.log(`Thông tin anime: ${JSON.stringify(animeData)}`);

      let description = animeData.description;
      if (description && description.length > 400) {
        description = description.slice(0, 400) + '...';
      }

      const embed = new MessageEmbed()
        .setTitle(animeData.title.romaji)
        .setDescription(description)
        .setColor('#66FFFF')
        .addFields(
          {
            name: 'Số tập',
            value: `${animeData.episodes || 'N/A'}`,
            inline: true,
          },
          {
            name: 'Trạng thái',
            value: `${animeData.status}`,
            inline: true,
          },
          {
            name: 'Đánh giá',
            value: `${animeData.averageScore}/100`,
            inline: true,
          },
          {
            name: 'Xếp hạng',
            value: `${animeData.meanScore}/100`,
            inline: true,
          },
          {
            name: 'Mùa',
            value: `${animeData.season}`,
            inline: true,
          },
          {
            name: 'Studio',
            value: `${animeData.studios.edges.map(edge => edge.node.name).join(', ')}`,
            inline: true,
          }
        )
        .setImage(animeData.coverImage.large)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm anime:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm anime.');
    }
  },
};
