const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('charactersearch')
    .setDescription('Tìm kiếm các bộ anime có chứa tên nhân vật.')
    .addStringOption(option => option.setName('character').setDescription('Tên nhân vật cần tìm').setRequired(true)),
  async execute(interaction) {
    const character = interaction.options.getString('character');

    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($character: String) {
            Character (search: $character) {
              name {
                full
              }
              media {
                nodes {
                  id
                  title {
                    romaji
                  }
                  coverImage {
                    large
                  }
                }
              }
              genres
            }
          }
        `,
        variables: { character },
      });

      const characterData = response.data.data.Character;

      if (!characterData) {
        return interaction.reply(`Không tìm thấy nhân vật: **${character}**`);
      }

      const embed = new MessageEmbed()
        .setTitle(`Các bộ anime có nhân vật: ${characterData.name.full}`)
        .setDescription(`Danh sách các bộ anime có nhân vật **${characterData.name.full}**:`)
        .setTimestamp();

      characterData.media.nodes.forEach(anime => {
        const animeTitle = anime.title.romaji || 'Không có thông tin.';
        embed.addFields({ name: animeTitle, value: '\u200B', inline: false });
      });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm nhân vật:', error);
      interaction.reply('Đã xảy ra lỗi khi tìm kiếm nhân vật.');
    }
  },
};
