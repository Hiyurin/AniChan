const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('characters')
    .setDescription('Lấy thông tin về một nhân vật cụ thể.')
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
            }
            image {
              large
            }
            description
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

      let description = characterData.description || 'Không có mô tả.';

      const embed = new MessageEmbed()
        .setTitle(characterData.name.full)
        .setURL(characterData.siteUrl)
        .setDescription(characterData.description)
        .addField('Các tác phẩm tham gia', characterData.media.nodes.map(node => node.title.romaji).join(', ') || 'Không có tác phẩm nào.')
        .setImage(characterData.image.large)
        .setColor('#C6FFFF')
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân vật:', error);
      interaction.reply('Đã xảy ra lỗi khi lấy thông tin nhân vật.');
    }
  },
};
