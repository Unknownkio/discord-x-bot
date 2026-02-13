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

// ENV VARIABLES
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY?.trim();
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

if (!DISCORD_TOKEN || !CHANNEL_ID || !RAPIDAPI_KEY || !TWITTER_USER_ID) {
  console.error("❌ Missing environment variables.");
  process.exit(1);
}

let lastTweetId = null;

// Bot Ready
client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("🔑 RapidAPI Key Length:", RAPIDAPI_KEY.length);

  checkTweets();              // Run immediately
  setInterval(checkTweets, 60000); // Then every 60 seconds
});

client.login(DISCORD_TOKEN);

// MAIN FUNCTION
async function checkTweets() {
  try {
    const response = await axios.get(
     https://twitter-v2-api.p.rapidapi.com/user-tweets?user_id=${TWITTER_USER_ID}
,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "twitter-v2-api.p.rapidapi.com",
        }
      }
    );

    const instructions = response.data?.result?.timeline?.instructions || [];
    let tweets = [];

    for (const instruction of instructions) {
      if (instruction.entries) {
        for (const entry of instruction.entries) {
          const tweet = entry?.content?.itemContent?.tweet_results?.result;
          if (tweet?.legacy?.full_text) {
            tweets.push(tweet);
          }
        }
      }
    }

    if (!tweets.length) {
      console.log("ℹ️ No tweets found.");
      return;
    }

    const latestTweet = tweets[0];

    if (latestTweet.rest_id !== lastTweetId) {
      lastTweetId = latestTweet.rest_id;

      const channel = await client.channels.fetch(CHANNEL_ID);

      await channel.send(
        `📰 **New Tweet from User:**\n\n${latestTweet.legacy.full_text}\n\nhttps://twitter.com/${latestTweet.core.user_results.result.core.screen_name}/status/${latestTweet.rest_id}`
      );

      console.log("✅ Posted new tweet:", latestTweet.rest_id);
    } else {
      console.log("⏳ No new tweet.");
    }

  } catch (error) {
    console.error("❌ FULL ERROR:");
    console.error(error.response?.data || error.message);
  }
}
