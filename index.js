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
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

let lastTweetId = null;

async function checkTweets() {
  try {
    const response = await axios.get(
      `https://twitter241.p.rapidapi.com/user-tweets?user=${TWITTER_USER_ID}&count=5`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "twitter241.p.rapidapi.com"
        }
      }
    );

    const tweets = response.data?.result?.timeline?.instructions
      ?.flatMap(i => i.entries || [])
      ?.map(e => e.content?.itemContent?.tweet_results?.result)
      ?.filter(Boolean);

    if (!tweets || tweets.length === 0) return;

    const newestTweet = tweets[0];

    if (lastTweetId && newestTweet.rest_id === lastTweetId) return;

    lastTweetId = newestTweet.rest_id;

    const text = newestTweet.legacy?.full_text;

    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(`🐦 New Tweet:\n\n${text}`);

  } catch (error) {
    console.error("Error fetching tweets:", error.response?.data || error.message);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(checkTweets, 60000);
});

client.login(DISCORD_TOKEN);
