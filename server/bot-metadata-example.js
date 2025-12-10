/**
 * Helper the Discord bot can use to push guild metadata
 * (channels + roles) to the dashboard API so dropdowns are populated.
 *
 * Quick usage in your bot:
 *   const { registerMetadataSync } = require('./bot-metadata-example');
 *   registerMetadataSync(client); // wires ready + guildCreate to POST /api/data/:guildId
 */

const fetch = require('node-fetch'); // npm i node-fetch@2

// Adjust to where your API is running
const API_URL = 'http://localhost:3001/api';

async function syncGuildMetadata(guild) {
    if (!guild) return;

    try {
        // Fetch fresh data from Discord just in case cache is stale
        const channels = (await guild.channels.fetch())
            .filter(ch => ch.isTextBased()) // keep text/news/thread channels only
            .map(ch => ({
                id: ch.id,
                name: ch.name || 'unknown'
            }));

        const roles = (await guild.roles.fetch()).map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor
        }));

        const res = await fetch(`${API_URL}/data/${guild.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channels, roles })
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`[CoroMod] Failed to sync metadata for ${guild.name}: ${body}`);
        } else {
            console.log(`[CoroMod] Synced ${channels.length} channels and ${roles.length} roles for ${guild.name}`);
        }
    } catch (err) {
        console.error(`[CoroMod] Metadata sync error for ${guild?.name}:`, err);
    }
}

/**
 * Convenience helper to wire the sync into a discord.js Client.
 * - On ready: sync every guild the bot is in.
 * - On guildCreate: sync the new guild immediately.
 */
function registerMetadataSync(client) {
    if (!client) return;

    client.once('ready', async () => {
        try {
            for (const [, guild] of client.guilds.cache) {
                await syncGuildMetadata(guild);
            }
        } catch (err) {
            console.error('[CoroMod] Failed initial metadata sync:', err);
        }
    });

    client.on('guildCreate', syncGuildMetadata);
}

module.exports = { syncGuildMetadata, registerMetadataSync };

