const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Scan a URL using VirusTotal')
        .addStringOption(option => option.setName('url').setDescription('URL to scan').setRequired(true))
        .addStringOption(option => option.setName('language').setDescription('Target language').setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const targetLanguage = interaction.options.getString('language');

        try {
            const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodeURIComponent(url)}`, {
                headers: {
                    'x-apikey': 'process.env.VIRUSTOTAL_API_KEY',
                },
            });

            const scanData = response.data.data;

            if (!scanData) {
                console.log(`No scan data found for URL: ${url}`);
                return interaction.reply(`No scan data found for URL: **${url}**`);
            }

            console.log(`Scan data: ${JSON.stringify(scanData)}`);

            const [translation] = await translate.translate(scanData.attributes.last_analysis_stats, targetLanguage);

            const embed = new MessageEmbed()
                .setTitle('VirusTotal Scan Result')
                .setDescription(`Scan result for URL: ${url}`)
                .setColor('#C6FFFF')
                .addFields(
                    {
                        name: 'Scan Date',
                        value: scanData.attributes.last_analysis_date,
                        inline: true,
                    },
                    {
                        name: 'Scan Result',
                        value: translation,
                        inline: true,
                    },
                    {
                        name: 'URL',
                        value: scanData.attributes.url,
                    }
                )
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error while scanning URL:', error);
            interaction.reply('An error occurred while scanning the URL.');
        }
    },
};
