import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

let lastTweetId = null;

async function checkTweets() {
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets`,
      {
        headers: {
          Authorization: `Bearer ${X_BEARER_TOKEN}`
        },
        params: {
          max_results: 5
        }
      }
    );

    const tweets = response.data.data;

    if (!tweets) return;

    const newestTweet = tweets[0];

    if (lastTweetId && newestTweet.id === lastTweetId) return;

    lastTweetId = newestTweet.id;

    const channel = await client.channels.fetch(CHANNEL_ID);
    channel.send(`🐦 New Tweet:\n\n${newestTweet.text}`);

  } catch (error) {
    console.error("Error fetching tweets:", error.response?.data || error.message);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(checkTweets, 60000); // checks every 60 seconds
});

client.login(DISCORD_TOKEN);
