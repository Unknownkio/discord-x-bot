import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY.trim();
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;

let lastTweetId = null;

console.log("🔑 RapidAPI Key Length:", RAPIDAPI_KEY?.length);

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  checkTweets();
  setInterval(checkTweets, 60000);
});

client.login(DISCORD_TOKEN);

async function checkTweets() {
  try {
    const response = await axios.get(
     https://twitter-v24.p.rapidapi.com/user-tweets?user_id=${TWITTER_USER_ID}
,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
         "X-RapidAPI-Host": "twitter-v24.p.rapidapi.com",
        },
      }
    );

    const instructions = response.data?.result?.timeline?.instructions || [];
    let tweets = [];

    for (const instruction of instructions) {
      if (instruction.entries) {
        for (const entry of instruction.entries) {
          const tweet =
            entry?.content?.itemContent?.tweet_results?.result;

          if (tweet?.legacy?.full_text) {
            tweets.push(tweet);
          }
        }
      }
    }

    if (!tweets.length) {
      console.log("⚠️ No tweets found.");
      return;
    }

    const latestTweet = tweets[0];

    if (latestTweet.rest_id !== lastTweetId) {
      lastTweetId = latestTweet.rest_id;

      const channel = await client.channels.fetch(CHANNEL_ID);

      await channel.send(
        `📰 **New Tweet:**\n\n${latestTweet.legacy.full_text}\n\nhttps://twitter.com/i/web/status/${latestTweet.rest_id}`
      );

      console.log("✅ Tweet posted:", latestTweet.rest_id);
    } else {
      console.log("⏳ No new tweet.");
    }
  } catch (error) {
    console.error(
      "❌ FULL ERROR:",
      error.response?.data || error.message
    );
  }
}
