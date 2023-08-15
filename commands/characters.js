const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Lấy thông tin của một nhân vật cụ thể.')
    .addStringOption(option => option.setName('name').setDescription('Tên của nhân vật cần tìm').setRequired(true)),
  async execute(interaction) {
    const characterName = interaction.options.getString('name');

    try {
      const query = `
        query ($search: String) {
          Character(search: $search) {
            id
            siteUrl
            name {
              full
              native
            }
            image {
              large
            }
            description(asHtml: false)
            media {
              nodes {
                title {
                  romaji
                }
              }
            }
          }
        }
      `;

      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: characterName },
      });

      const characterData = response.data.data.Character;

      if (!characterData) {
        console.log(`Không tìm thấy thông tin nhân vật: ${characterName}`);
        return interaction.reply(`Không tìm thấy thông tin nhân vật: **${characterName}**`);
      }

      console.log(`Thông tin nhân vật: ${JSON.stringify(characterData)}`);

      const embed = new MessageEmbed()
        .setTitle(`Thông tin của nhân vật: ${characterData.name.full}`)
        .setURL(characterData.siteUrl)
        .setDescription(characterData.description || 'Không có thông tin mô tả.')
        .setThumbnail(characterData.image.large)
        .setTimestamp();

      if (characterData.media.nodes.length > 0) {
        const mediaList = characterData.media.nodes.map(node => node.title.romaji).join(', ');
        embed.addField('Các bộ anime liên quan', mediaList);
      }

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân vật:', error);
      interaction.reply('Đã xảy ra lỗi khi lấy thông tin nhân vật.');
    }
  },
};
