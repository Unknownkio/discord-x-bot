import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Environment Variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

let lastTweetId = null;

// Function to check tweets
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
      ?.find(i => i.entries)
      ?.entries || [];

    for (const entry of tweets) {
      const tweet =
        entry.content?.itemContent?.tweet_results?.result;

      if (!tweet) continue;

      const tweetId = tweet.rest_id;
      const tweetText = tweet.legacy?.full_text;

      if (tweetId && tweetId !== lastTweetId) {
        lastTweetId = tweetId;

        const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;
        const channel = await client.channels.fetch(CHANNEL_ID);

        await channel.send(
          `🚨 **New Tweet Posted!**\n\n${tweetText}\n\n${tweetUrl}`
        );

        break; // only post newest one
      }
    }
  } catch (error) {
    console.error("Error fetching tweets:", error.response?.data || error.message);
  }
}

// Bot Ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Check immediately
  checkTweets();

  // Check every 60 seconds
  setInterval(checkTweets, 60000);
});

client.login(DISCORD_TOKEN);
