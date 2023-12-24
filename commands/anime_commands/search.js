const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

const commandCooldown = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Tìm kiếm anime bằng hình ảnh. (Hỗ trợ dung lượng ảnh tối đa 25MB)')
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Liên kết hình ảnh')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('cut_black_borders')
                .setDescription('Cắt viền đen của ảnh.')
                .setRequired(true)),
    async execute(interaction) {
        const imageUrl = interaction.options.getString('image');
        const cutBorders = interaction.options.getBoolean('cut_borders');
        
        if (commandCooldown.has(interaction.user.id)) {
            const lastUsage = commandCooldown.get(interaction.user.id);
            const currentTime = Date.now();
            const cooldownTime = 60 * 60 * 1000;

            if (currentTime - lastUsage < cooldownTime) {
                const remainingTime = cooldownTime - (currentTime - lastUsage);
                const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
                return interaction.reply(`Vì bị giới hạn yêu cầu api đến máy chủ trace.moe, bạn chỉ có thể sử dụng lệnh này mỗi 60 phút một lần.\nVui lòng thử lại sau ${remainingMinutes} phút hoặc bạn có thể sử dụng trực tiếp trên máy chủ [trace.moe](https://trace.moe/).`);
            }
        }

        try {
            const adminIDs = fs.readFileSync('./adminID.txt', 'utf8').split(',');
            const isAdmin = adminIDs.includes(interaction.user.id);
            let bypassLimit = false;

            if (isAdmin) {
                bypassLimit = true;
            }

            if (!bypassLimit) {
                const lastUsage = commandCooldown.get(interaction.user.id);
                const currentTime = Date.now();
                const cooldownTime = 60 * 60 * 1000;

                if (currentTime - lastUsage < cooldownTime) {
                    const remainingTime = cooldownTime - (currentTime - lastUsage);
                    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
                    return interaction.reply(`Vì bị giới hạn yêu cầu api đến máy chủ trace.moe, bạn chỉ có thể sử dụng lệnh này mỗi 60 phút một lần.\nVui lòng thử lại sau ${remainingMinutes} phút hoặc bạn có thể sử dụng trực tiếp trên máy chủ [trace.moe](https://trace.moe/).`);
                }
            }

            let apiUrl = 'https://api.trace.moe/search?url=' + encodeURIComponent(imageUrl);
            if (cutBorders) {
                apiUrl = 'https://api.trace.moe/search?cutBorders&url=' + encodeURIComponent(imageUrl);
            }

            const response = await axios.get(apiUrl);
            const data = response.data;
            if (data.result && data.result.length > 0) {
                const animeid = data.result[0].anilist;
                const response = await axios.post('https://graphql.anilist.co', {
                    query: `
                        query ($id: Int) {
                            Media (id: $id, type: ANIME) {
                                siteUrl
                                title { romaji english native }
                                coverImage { large }
                                description
                                genres
                            }
                        }`,
                    variables: { id: animeid },
                });

                const animename = response.data.data.Media.title.english || response.data.data.Media.title.romaji || response.data.data.Media.title.native;
                const coverImage = response.data.data.Media.coverImage.large;
                let description = response.data.data.Media.description;
                if (description && description.length > 400) {
                    description = description.slice(0, 400) + '...';
                }
                const genres = response.data.data.Media.genres;
                if (genres.includes('Ecchi') || genres.includes('Hentai')) {
                    return interaction.reply(`**AniChan đã chặn kết quả tìm kiếm.**\n__Lý do:__ Để bảo vệ máy chủ của bạn khỏi điều khoản dịch vụ của Discord, AniChan chặn các kết quả tìm kiếm chứa nội dung ||ecchi, hentai||.`);
                }
                const episode = data.result[0].episode;
                const similarity = data.result[0].similarity * 100;
                const similarityINT = similarity.toFixed(0);

                const embed = new MessageEmbed()
                    .setTitle(`Anime: ${animename}`)
                    .setURL(`https://anilist.co/anime/${animeid}`)
                    .setDescription(`Mô tả: ${description}`)
                    .addFields(
                        { name: 'Xuất hiện trong tập:', value: `${episode}`, inline: true },
                        { name: 'Tỉ lệ trùng khớp:', value: `${similarityINT} %`, inline: true }
                    )
                    .setImage(`${coverImage}`);

                interaction.reply({ embeds: [embed] });

                commandCooldown.set(interaction.user.id, Date.now());
            } else {
                interaction.reply('Không tìm thấy anime nào cho hình ảnh được cung cấp.');
            }
        } catch (error) {
            console.error(error);
            interaction.reply('Đã xảy ra lỗi khi tìm kiếm hình ảnh.');
        }
    },
};
