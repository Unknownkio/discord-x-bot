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
