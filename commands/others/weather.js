const weather = require('weather-js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Kiểm tra dự báo thời tiết cho một địa điểm nhất định')
        .addStringOption(option => option.setName("city").setDescription("Tên thành phố bạn muốn xem thông tin.").setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');

        weather.find({ search: city, degreeType: 'C' }, function (error, result) {
            if (error) return interaction.reply(error);
            if (result === undefined || result.length === 0) return interaction.reply('Không tìm thấy thành phố đã nhập. Vui lòng thử lại');

            const current = result[0].current;
            const location = result[0].location;

            const embed = new MessageEmbed()
                .setTitle(current.observationpoint)
                .setDescription(`${current.skytext}`)
                .setThumbnail(current.imageUrl)
                .setTimestamp()
                .addFields(
                    {
                        name: 'Kinh độ',
                        value: location.long,
                        inline: true,
                    },
                    { 
                        name: 'Vĩ độ', 
                        value: location.lat, 
                        inline: true },
                    {
                        name: 'Đơn vị đo',
                        value: `°${location.degreetype}`,
                        inline: true,
                    },
                    {
                        name: 'Nhiệt độ đo được',
                        value: `${current.temperature}°${location.degreetype}`,
                        inline: true,
                    },
                    {
                        name: 'Nhiệt độ cảm nhận',
                        value: `${current.feelslike}°${location.degreetype}`,
                        inline: true,
                    },
                    {
                        name: 'Gió',
                        value: `${current.winddisplay}`,
                        inline: true,
                    },
                    {
                        name: 'Độ ẩm',
                        value: `${current.humidity}%`,
                        inline: true,
                    },
                    {
                        name: 'Cập nhật lúc',
                        value: `${current.observationtime}, GMT ${location.timezone}`,
                        inline: true,
                    }
                )
                .setFooter({ text: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) })
                .setColor('#66FFFF');

            interaction.reply({ embeds: [embed] });
        });
    },
};

