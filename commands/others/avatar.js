const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Lấy avatar của người dùng")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Người dùng cần lấy avatar:')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.find(m => m.user.id === user.id) || interaction.member;

        const avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        const embed = new MessageEmbed()
            .setTitle(`${member.user.username} Avatar`)
            .setURL(avatar)
            .setImage(avatar)
            .setFooter({
                text: `Request by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            })
            .setColor('#eb3434');

        await interaction.reply({ embeds: [embed] });
    },
};
