const { StarRail } = require("starrail.js");
const client = new StarRail({ defaultLanguage: "vi" });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const characters = client.getAllCharacters();

const command = new SlashCommandBuilder()
    .setName('hsrcharacters')
    .setDescription('Lấy danh sách nhân vật trong Honkai Star Rail');

const execute = async (interaction) => {
    const characterGroups = characters.reduce((groups, character) => {
        const combatType = character.combatType.name.get();
        if (!groups[combatType]) {
            groups[combatType] = [];
        }
        if (character.name.get() !== '{NICKNAME}') {
            groups[combatType].push(character);
        }
        return groups;
    }, {});

    const embed = new MessageEmbed()
        .setTitle('Danh sách nhân vật')
        .setColor('#0099ff');

    for (const combatType in characterGroups) {
        const charactersInGroup = characterGroups[combatType];
        const characterNames = charactersInGroup.map(character => character.name.get()).join(', ');
        embed.addFields({ name: combatType, value: characterNames });
    }

    await interaction.reply({ embeds: [embed] });
};

module.exports = {
    data: command,
    execute,
};
