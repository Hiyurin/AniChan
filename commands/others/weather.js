const weather = require('weather-js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Checks a weather forecast')
        .addStringOption(option => option.setName('city').setDescription('The city to check the weather for').setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');

        weather.find({ search: city, degreeType: 'C' }, function (error, result) {
            if (error) return interaction.reply(error);
            if (result === undefined || result.length === 0) return interaction.reply('Unknown city. Please try again');

            const current = result[0].current;
            const location = result[0].location;

            const embed = new MessageEmbed()
                .setTitle(current.observationpoint)
                .setDescription(`${current.skytext}`)
                .setThumbnail(current.imageUrl)
                .setTimestamp()
                .addFields(
                    {
                        name: 'Longitude',
                        value: location.long,
                        inline: true,
                    },
                    {
                        name: 'Feels Like',
                        value: `${current.feelslike}° Degrees`,
                        inline: true,
                    },
                    {
                        name: 'Degree Type',
                        value: location.degreetype,
                        inline: true,
                    },
                    {
                        name: 'Winds',
                        value: current.winddisplay,
                        inline: true,
                    },
                    {
                        name: 'Humidity',
                        value: `${current.humidity}%`,
                        inline: true,
                    },
                    {
                        name: 'Timezone',
                        value: `GMT ${location.timezone}`,
                        inline: true,
                    },
                    {
                        name: 'Temperature',
                        value: `${current.temperature}° Degrees`,
                        inline: true,
                    },
                    {
                        name: 'Observation Time',
                        value: current.observationtime,
                        inline: true,
                    }
                )
                .setFooter({ text: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) })
                .setColor('#66FFFF');

            interaction.reply({ embeds: [embed] });
        });
    },
};

