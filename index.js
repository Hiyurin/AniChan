const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const commands = new Collection();

const token = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log('Bot đã sẵn sàng!');
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply('Đã xảy ra lỗi khi thực hiện lệnh này.');
  }
});

client.login(token).then(() => {
  const commandsArray = commands.map(command => command.data.toJSON());
  const rest = new REST({ version: '9' }).setToken(token);

  (async () => {
    try {
      console.log('Đang đăng ký các lệnh gạch chéo...');
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commandsArray },
      );

      console.log('Đã đăng ký các lệnh gạch chéo thành công!');
    } catch (error) {
      console.error('Đã xảy ra lỗi khi đăng ký các lệnh gạch chéo:', error);
    }
  })();
});
