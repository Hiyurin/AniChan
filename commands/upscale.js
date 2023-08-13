const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const waifu2x = require('waifu2x');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upscale')
    .setDescription('Tăng chất lượng hình ảnh bằng waifu2x')
    .addStringOption(option => option.setName('image').setDescription('Liên kết đến hình ảnh cần tăng chất lượng.').setRequired(true)),
  async execute(interaction) {
    const imageUrl = interaction.options.getString('image');

    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const imageBuffer = Buffer.from(response.data, 'binary');

      const waifu2xResult = await waifu2x(imageBuffer, { noise: 3, scale: 2 });

      const tempFilePath = 'temp.png';
      fs.writeFileSync(tempFilePath, waifu2xResult);

      interaction.reply({ files: [tempFilePath] });

      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error('Lỗi khi upscale hình ảnh:', error);
      interaction.reply('Đã xảy ra lỗi khi upscale hình ảnh.');
    }
  },
};
