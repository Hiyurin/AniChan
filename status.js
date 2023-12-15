const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const activities = [
  { name: 'watching', type: 'WATCHING', text: 'anime' },
  { name: 'watching', type: 'WATCHING', text: 'invite.anichan.hiyurin.asia' },
];

function setRandomActivity() {
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  client.user.setActivity(randomActivity.text, { type: randomActivity.type });
}

client.once('ready', () => {
  console.log('Trạng thái bot sẵn sàng!');

  setRandomActivity();
  setInterval(() => {
    setRandomActivity();
  }, 10 * 60 * 1000);
});

client.login(process.env.BOT_TOKEN);

