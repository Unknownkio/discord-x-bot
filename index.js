import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  checkTweets(); // run immediately
  setInterval(checkTweets, 60000); // then every minute
});

client.login(DISCORD_TOKEN);


const CHANNEL_ID = process.env.CHANNEL_ID;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY.trim();
 console.log("Key length:", RAPIDAPI_KEY ? RAPIDAPI_KEY.length : "undefined");
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

let lastTweetId = null;

async function checkTweets() {
  try {
    const response = await axios.get(
      `https://twitter241.p.rapidapi.com/user-tweets?user=${TWITTER_USER_ID}&count=5`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
        },
      }
    );

    console.log("RAW RESPONSE:", response.data);

    const tweets = response.data.tweets || [];
    if (!tweets.length) return;

    const latestTweet = tweets[0];

    if (latestTweet.id !== lastTweetId) {
      lastTweetId = latestTweet.id;

      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`📰 New Tweet:\n${latestTweet.text}`);
    }
  } catch (error) {
    console.error("FULL ERROR:", error.response?.data || error.message);
  }
}


