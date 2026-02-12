import dotenv from "dotenv";
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;
 import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
 const response = await axios.get(
  `https://twitter241.p.rapidapi.com/user-tweets?user=${TWITTER_USER_ID}&count=5`,
  {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "twitter241.p.rapidapi.com"
    }
  }
);
