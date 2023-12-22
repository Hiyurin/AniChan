const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Lấy thông tin cá nhân của một staff cụ thể.')
        .addStringOption(option => option.setName('name').setDescription('Tên của staff cần tìm').setRequired(true)),
    async execute(interaction) {
        const staffName = interaction.options.getString('name');

        try {
            const query = `
        query ($search: String) {
          Staff(search: $search) {
            id
            siteUrl
            name {
              first
              last
            }
            image {
              large
            }
            description
          }
        }
      `;

            const response = await axios.post('https://graphql.anilist.co', {
                query,
                variables: { search: staffName },
            });

            const staffData = response.data.data.Staff;

            if (!staffData) {
                return interaction.reply(`Không tìm thấy thông tin staff: **${staffName}**`);
            }

            const embed = new MessageEmbed()
                .setTitle(`Thông tin cá nhân của staff: ${staffData.name.first} ${staffData.name.last}`)
                .setURL(staffData.siteUrl)
                .setDescription(staffData.description || 'Không có thông tin.')
                .setImage(staffData.image.large)
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin staff:', error);
            interaction.reply('Đã xảy ra lỗi khi lấy thông tin staff.');
        }
    },
};
