const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const figlet = require('figlet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('Chuyển đổi văn bản thành mã ASCII')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Nhập văn bản cần chuyển đổi')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('text');

        figlet.text(text, function (err, data) {
            if (err) {
                console.dir(err);
            }
            if (data.length > 2000) return interaction.reply('**Vui lòng cung cấp văn bản ngắn hơn 2000 ký tự**');

            interaction.reply('```' + data + '```');
        });
    },
};
