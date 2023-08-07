const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('studio')
    .setDescription('Lấy thông tin về studio và danh sách anime được sản xuất bởi studio.')
    .addStringOption(option => option.setName('name').setDescription('Tên của studio cần tìm').setRequired(true)),
  async execute(interaction) {
    const studioName = interaction.options.getString('name');

    try {
      const query = `
        query ($search: String) {
          Studio(search: $search) {
            id
            name
            siteUrl
            media(isMain: true, sort: POPULARITY_DESC ) {
              nodes {
                siteUrl
                title {
                  romaji
                }
                startDate {
                  year
                }
              }
            }
          }
        }
      `;

      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: studioName },
      });

      const studioData = response.data.data.Studio;

      if (!studioData) {
        console.log(`Không tìm thấy thông tin studio: ${studioName}`);
        return interaction.reply(`Không tìm thấy thông tin studio: **${studioName}**`);
      }

      console.log(`Thông tin studio: ${JSON.stringify(studioData)}`);

      const embed = new MessageEmbed()
        .setTitle(`Thông tin về studio: ${studioData.name}`)
        .setURL(studioData.siteUrl)
        .setDescription(`Danh sách các anime được sản xuất bởi studio ${studioData.name}:`)
        .setTimestamp();

      const animeRows = [];
      for (const anime of studioData.media.nodes) {
        const animeTitle = anime.title.romaji;
        const animeUrl = anime.siteUrl;
        const animeYear = anime.startDate ? anime.startDate.year : 'N/A';
        animeRows.push(`[${animeTitle}](${animeUrl}) - Năm sản xuất: ${animeYear}`);
      }

      const pageSize = 5;
      const totalPages = Math.ceil(animeRows.length / pageSize);
      let currentPage = 0;

      const updateEmbed = () => {
        const startIdx = currentPage * pageSize;
        const endIdx = startIdx + pageSize;
        const animeList = animeRows.slice(startIdx, endIdx).join('\n');
        
        embed.setDescription(`Danh sách các anime được sản xuất bởi studio ${studioData.name}:\n${animeList}`);

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('prev')
              .setLabel('Trang trước')
              .setStyle('PRIMARY')
              .setDisabled(currentPage === 0),
            new MessageButton()
              .setCustomId('next')
              .setLabel('Trang sau')
              .setStyle('PRIMARY')
              .setDisabled(currentPage === totalPages - 1)
          );

        return { embeds: [embed], components: [row] };
      };

      const interactionReply = await interaction.reply(updateEmbed());

      const filter = i => i.customId === 'prev' || i.customId === 'next';
      const collector = interactionReply.createMessageComponentCollector({ filter, time: 30000 });

      collector.on('collect', async i => {
        if (i.customId === 'prev' && currentPage > 0) {
          currentPage--;
        } else if (i.customId === 'next' && currentPage < totalPages - 1) {
          currentPage++;
        }
        await i.update(updateEmbed());
      });

      collector.on('end', collected => {
        interactionReply.edit({ components: [] });
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin studio:', error);
      interaction.reply('Đã xảy ra lỗi khi lấy thông tin studio.');
    }
  },
};
