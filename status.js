const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const activities = [
  { name: 'playing', type: 'PLAYING', text: '/help' },
  { name: 'watching', type: 'WATCHING', text: 'anime' },
];

function setRandomActivity() {
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  client.user.setActivity(randomActivity.text, { type: randomActivity.type });
}

client.once('ready', () => {
  console.log('Trạng thái bot đã sẵn sàng!');

  setRandomActivity();
  setInterval(() => {
    setRandomActivity();
  }, 10 * 60 * 1000);
});

client.login(process.env.BOT_TOKEN);

