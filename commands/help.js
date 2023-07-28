const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Hiển thị cách sử dụng và chức năng của tất cả các lệnh.'),
  async execute(interaction) {
    try {
      const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
      const embed = new MessageEmbed()
        .setTitle('Danh sách các lệnh')
        .setDescription('Dưới đây là danh sách các lệnh có sẵn và cách sử dụng của chúng:')
        .setTimestamp();

      for (const file of commandFiles) {
        const command = require(`./${file}`);
        embed.addField(`/${command.data.name}`, command.data.description || 'Không có mô tả', false);
      }

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi hiển thị trợ giúp:', error);
      interaction.reply('Đã xảy ra lỗi khi hiển thị trợ giúp.');
    }
  },
};
