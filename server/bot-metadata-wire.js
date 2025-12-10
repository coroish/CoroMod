/**
 * Lightweight wiring example to ensure your Discord bot posts
 * channels/roles to `/api/data/:guildId` using the provided helper.
 *
 * Requirements:
 * - discord.js v14 (npm i discord.js)
 * - node-fetch v2 is already a dependency for the helper
 *
 * How to use:
 *   1) Install discord.js in your bot project: npm i discord.js
 *   2) Point BOT_TOKEN env var to your bot token.
 *   3) Run: node bot-metadata-wire.js
 *
 * Replace this file or copy the relevant bits into your real bot entry file.
 */

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { registerMetadataSync } = require('./bot-metadata-example');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
});

registerMetadataSync(client);

client.once('ready', () => {
    console.log(`[CoroMod] Bot ready as ${client.user.tag}. Metadata sync enabled.`);
});

client.login(process.env.BOT_TOKEN);

