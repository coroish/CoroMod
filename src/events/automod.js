const { Events, Collection } = require('discord.js');
const { getGuildSettings } = require('../utils/database');
const { warningEmbed } = require('../utils/embedBuilder');
const { sendLog, logEmbed } = require('../utils/logger');
const settings = require('../config/settings');

// Store for tracking user messages (for spam detection)
const messageCache = new Collection();

// Bad words list (configurable)
const badWords = settings.automod.badWords.words;

// URL regex pattern
const urlPattern = /(https?:\/\/[^\s]+)/gi;

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        // Ignore bots and DMs
        if (message.author.bot) return;
        if (!message.guild) return;

        // Get guild settings
        const guildSettings = getGuildSettings(message.guild.id);

        // Check if automod is enabled (default to true if no settings)
        if (guildSettings?.automod_enabled === 0) return;

        // Run automod checks
        await checkSpam(message, guildSettings);
        await checkBadWords(message, guildSettings);
        await checkLinks(message, guildSettings);
    }
};

/**
 * Check for spam (too many messages in a short time)
 */
async function checkSpam(message, guildSettings) {
    // Check if anti-spam is disabled
    if (guildSettings?.anti_spam === 0) return;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const userMessages = messageCache.get(key) || [];

    // Clean old messages (older than 5 seconds)
    const recentMessages = userMessages.filter(
        timestamp => now - timestamp < settings.automod.antiSpam.interval
    );

    // Add current message
    recentMessages.push(now);
    messageCache.set(key, recentMessages);

    // Check if user is spamming
    if (recentMessages.length >= settings.automod.antiSpam.maxMessages) {
        try {
            const member = message.member;

            // Clear the cache for this user
            messageCache.delete(key);

            // Check if we can moderate this user
            if (!member.moderatable) return;

            // Take action based on config
            await member.timeout(
                settings.automod.antiSpam.timeoutDuration,
                'Auto-mod: Spam detected'
            );

            // Delete recent messages from the user
            const messages = await message.channel.messages.fetch({ limit: 10 });
            const userSpamMessages = messages.filter(
                m => m.author.id === message.author.id &&
                    now - m.createdTimestamp < settings.automod.antiSpam.interval
            );
            await message.channel.bulkDelete(userSpamMessages).catch(() => { });

            // Notify user
            await message.channel.send({
                embeds: [warningEmbed(
                    'Spam Detected',
                    `${message.author} has been muted for 1 minute for spamming.`
                )]
            }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));

            // Log the action
            const log = logEmbed(
                '🚫 Auto-Mod: Spam',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Action:** 1 minute timeout`,
                settings.errorColor
            );
            await sendLog(message.guild, log);

        } catch (error) {
            console.error('Anti-spam error:', error);
        }
    }
}

/**
 * Check for bad words
 */
async function checkBadWords(message, guildSettings) {
    // Check if bad word filter is disabled
    if (guildSettings?.bad_word_filter === 0) return;

    const content = message.content.toLowerCase();
    const foundBadWord = badWords.some(word => content.includes(word.toLowerCase()));

    if (foundBadWord) {
        try {
            // Delete the message
            await message.delete();

            // Notify the user
            await message.channel.send({
                embeds: [warningEmbed(
                    'Message Deleted',
                    `${message.author}, your message was removed for containing inappropriate content.`
                )]
            }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));

            // Log the action
            const log = logEmbed(
                '🚫 Auto-Mod: Bad Word',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Content:** ||${message.content.slice(0, 200)}||`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

        } catch (error) {
            console.error('Bad word filter error:', error);
        }
    }
}

/**
 * Check for links
 */
async function checkLinks(message, guildSettings) {
    // Check if link filter is disabled
    if (!guildSettings?.anti_links) return;

    const urls = message.content.match(urlPattern);
    if (!urls) return;

    // Check if any URL is not whitelisted
    const whitelisted = settings.automod.antiLinks.whitelistedDomains;
    const hasBlockedLink = urls.some(url => {
        try {
            const domain = new URL(url).hostname;
            return !whitelisted.some(allowed => domain.includes(allowed));
        } catch {
            return true; // Invalid URL, block it
        }
    });

    if (hasBlockedLink) {
        try {
            // Delete the message
            await message.delete();

            // Notify the user
            await message.channel.send({
                embeds: [warningEmbed(
                    'Link Removed',
                    `${message.author}, links are not allowed in this server.`
                )]
            }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));

            // Log the action
            const log = logEmbed(
                '🔗 Auto-Mod: Link',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Content:** ${message.content.slice(0, 200)}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

        } catch (error) {
            console.error('Link filter error:', error);
        }
    }
}
