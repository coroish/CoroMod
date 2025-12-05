const { Events, Collection, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings, logModAction: dbLogModAction } = require('../utils/database');
const { warningEmbed, errorEmbed } = require('../utils/embedBuilder');
const { sendLog, logEmbed } = require('../utils/logger');
const settings = require('../config/settings');

// Store for tracking user messages (for spam detection)
const messageCache = new Collection();

// Store for tracking duplicate messages
const duplicateCache = new Collection();

// Store for tracking user violations (for progressive punishment)
const violationCache = new Collection();

// Store for tracking joins (for anti-raid)
const joinCache = new Collection();

// Bad words list (configurable)
const badWords = settings.automod.badWords.words;

// Patterns
const urlPattern = /(https?:\/\/[^\s]+)/gi;
const invitePattern = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;
const emojiPattern = /<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

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

        // Check if user can bypass automod (admins, mods with ManageMessages)
        if (canBypassAutomod(message.member)) return;

        // Run all automod checks
        const violations = [];

        if (await checkSpam(message, guildSettings)) violations.push('spam');
        if (await checkBadWords(message, guildSettings)) violations.push('badword');
        if (await checkLinks(message, guildSettings)) violations.push('link');
        if (await checkInvites(message, guildSettings)) violations.push('invite');
        if (await checkCaps(message, guildSettings)) violations.push('caps');
        if (await checkMassMention(message, guildSettings)) violations.push('mention');
        if (await checkEmojiSpam(message, guildSettings)) violations.push('emoji');
        if (await checkDuplicates(message, guildSettings)) violations.push('duplicate');
    }
};

/**
 * Check if member can bypass automod
 */
function canBypassAutomod(member) {
    if (!member) return false;

    // Server owner always bypasses
    if (member.guild.ownerId === member.id) return true;

    // Admins bypass
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

    // Users with ManageMessages bypass
    if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return true;

    return false;
}

/**
 * Track violations for progressive punishment
 */
function trackViolation(guildId, userId, type) {
    const key = `${guildId}-${userId}`;
    const now = Date.now();
    const userData = violationCache.get(key) || { violations: [], lastWarning: 0 };

    // Clean old violations (older than 1 hour)
    userData.violations = userData.violations.filter(v => now - v.time < 3600000);

    // Add new violation
    userData.violations.push({ type, time: now });
    violationCache.set(key, userData);

    return userData.violations.length;
}

/**
 * Get punishment based on violation count
 */
function getPunishment(violationCount) {
    if (violationCount >= 10) return { action: 'ban', duration: null, reason: 'Repeated automod violations' };
    if (violationCount >= 7) return { action: 'kick', duration: null, reason: 'Multiple automod violations' };
    if (violationCount >= 5) return { action: 'timeout', duration: 3600000, reason: '5+ violations - 1 hour timeout' }; // 1 hour
    if (violationCount >= 3) return { action: 'timeout', duration: 600000, reason: '3+ violations - 10 minute timeout' }; // 10 min
    if (violationCount >= 2) return { action: 'timeout', duration: 60000, reason: '2+ violations - 1 minute timeout' }; // 1 min
    return { action: 'warn', duration: null, reason: 'First warning' };
}

/**
 * Apply punishment based on violations
 */
async function applyPunishment(message, violationType, customReason = null) {
    const member = message.member;
    if (!member?.moderatable) return;

    const violationCount = trackViolation(message.guild.id, message.author.id, violationType);
    const punishment = getPunishment(violationCount);

    try {
        switch (punishment.action) {
            case 'ban':
                await member.ban({ reason: `Auto-mod: ${punishment.reason}` });
                dbLogModAction(message.guild.id, 'BAN', message.author.id, message.client.user.id, `Auto-mod: ${punishment.reason}`);
                break;

            case 'kick':
                await member.kick(`Auto-mod: ${punishment.reason}`);
                dbLogModAction(message.guild.id, 'KICK', message.author.id, message.client.user.id, `Auto-mod: ${punishment.reason}`);
                break;

            case 'timeout':
                await member.timeout(punishment.duration, `Auto-mod: ${customReason || punishment.reason}`);
                dbLogModAction(message.guild.id, 'MUTE', message.author.id, message.client.user.id, `Auto-mod: ${customReason || punishment.reason}`);
                break;

            case 'warn':
                dbLogModAction(message.guild.id, 'WARN', message.author.id, message.client.user.id, `Auto-mod: ${customReason || violationType}`);
                break;
        }

        return { punishment, violationCount };
    } catch (error) {
        console.error('Punishment error:', error);
        return null;
    }
}

/**
 * Check for spam (too many messages in a short time)
 */
async function checkSpam(message, guildSettings) {
    if (guildSettings?.anti_spam === 0) return false;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const userMessages = messageCache.get(key) || [];

    // Clean old messages (older than interval)
    const recentMessages = userMessages.filter(
        timestamp => now - timestamp < settings.automod.antiSpam.interval
    );

    recentMessages.push(now);
    messageCache.set(key, recentMessages);

    if (recentMessages.length >= settings.automod.antiSpam.maxMessages) {
        try {
            messageCache.delete(key);

            // Delete spam messages
            const messages = await message.channel.messages.fetch({ limit: 15 });
            const userSpamMessages = messages.filter(
                m => m.author.id === message.author.id &&
                    now - m.createdTimestamp < settings.automod.antiSpam.interval
            );
            await message.channel.bulkDelete(userSpamMessages).catch(() => { });

            // Apply punishment
            const result = await applyPunishment(message, 'spam', 'Message spam detected');

            // Notify
            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '🚫 Spam Detected',
                    `${message.author} - Stop spamming!\n` +
                    `**Violation #${result?.violationCount || 1}** | ${result?.punishment?.reason || 'Warning issued'}`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            // Log
            const log = logEmbed(
                '🚫 Auto-Mod: Spam',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Messages:** ${recentMessages.length} in ${settings.automod.antiSpam.interval / 1000}s\n` +
                `**Action:** ${result?.punishment?.action || 'warn'}`,
                settings.errorColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Anti-spam error:', error);
        }
    }
    return false;
}

/**
 * Check for bad words
 */
async function checkBadWords(message, guildSettings) {
    if (guildSettings?.bad_word_filter === 0) return false;

    const content = message.content.toLowerCase();
    const foundWord = badWords.find(word => content.includes(word.toLowerCase()));

    if (foundWord) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'badword', 'Inappropriate language');

            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '🤬 Inappropriate Content',
                    `${message.author}, watch your language!\n` +
                    `**Violation #${result?.violationCount || 1}**`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '🤬 Auto-Mod: Bad Word',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Word:** ||${foundWord}||\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Bad word filter error:', error);
        }
    }
    return false;
}

/**
 * Check for links
 */
async function checkLinks(message, guildSettings) {
    if (!guildSettings?.anti_links) return false;

    const urls = message.content.match(urlPattern);
    if (!urls) return false;

    const whitelisted = settings.automod.antiLinks.whitelistedDomains;
    const hasBlockedLink = urls.some(url => {
        try {
            const domain = new URL(url).hostname;
            return !whitelisted.some(allowed => domain.includes(allowed));
        } catch {
            return true;
        }
    });

    if (hasBlockedLink) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'link', 'Posting unauthorized links');

            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '🔗 Link Removed',
                    `${message.author}, links are not allowed here!\n` +
                    `**Violation #${result?.violationCount || 1}**`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '🔗 Auto-Mod: Blocked Link',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Link filter error:', error);
        }
    }
    return false;
}

/**
 * Check for Discord invites
 */
async function checkInvites(message, guildSettings) {
    // Check if anti-invite is enabled (you can add this to settings)
    if (guildSettings?.anti_invites === 0) return false;

    const hasInvite = invitePattern.test(message.content);

    if (hasInvite) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'invite', 'Posting Discord invite links');

            const notifyMsg = await message.channel.send({
                embeds: [errorEmbed(
                    '🚫 Invite Link Blocked',
                    `${message.author}, server invite links are not allowed!\n` +
                    `**Violation #${result?.violationCount || 1}**`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '🔗 Auto-Mod: Invite Link',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.errorColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Invite filter error:', error);
        }
    }
    return false;
}

/**
 * Check for excessive CAPS
 */
async function checkCaps(message, guildSettings) {
    if (guildSettings?.anti_caps === 0) return false;

    const content = message.content;
    if (content.length < 10) return false; // Ignore short messages

    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length < 8) return false;

    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const capsPercent = (capsCount / letters.length) * 100;

    if (capsPercent > 70) { // More than 70% caps
        try {
            await message.delete();

            const result = await applyPunishment(message, 'caps', 'Excessive caps lock');

            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '🔊 CAPS Lock',
                    `${message.author}, please don't shout! Turn off CAPS lock.\n` +
                    `**Violation #${result?.violationCount || 1}**`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '🔊 Auto-Mod: Caps Lock',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Caps:** ${Math.round(capsPercent)}%\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Caps filter error:', error);
        }
    }
    return false;
}

/**
 * Check for mass mentions
 */
async function checkMassMention(message, guildSettings) {
    if (guildSettings?.anti_mass_mention === 0) return false;

    const mentionLimit = settings.automod.massMention?.limit || 5;
    const totalMentions = message.mentions.users.size + message.mentions.roles.size;

    // Also count @everyone/@here
    const everyoneMention = message.content.includes('@everyone') || message.content.includes('@here');

    if (totalMentions >= mentionLimit || everyoneMention) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'mention', 'Mass mentioning users');

            const notifyMsg = await message.channel.send({
                embeds: [errorEmbed(
                    '📢 Mass Mention Blocked',
                    `${message.author}, don't spam mentions!\n` +
                    `**Violation #${result?.violationCount || 1}** | Limit: ${mentionLimit} mentions`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '📢 Auto-Mod: Mass Mention',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Mentions:** ${totalMentions} (limit: ${mentionLimit})\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.errorColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Mass mention filter error:', error);
        }
    }
    return false;
}

/**
 * Check for emoji spam
 */
async function checkEmojiSpam(message, guildSettings) {
    if (guildSettings?.anti_emoji_spam === 0) return false;

    const emojiLimit = settings.automod.emojiSpam?.limit || 10;
    const emojis = message.content.match(emojiPattern) || [];

    if (emojis.length >= emojiLimit) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'emoji', 'Emoji spam');

            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '😵 Emoji Spam',
                    `${message.author}, too many emojis!\n` +
                    `**Violation #${result?.violationCount || 1}** | Limit: ${emojiLimit} emojis`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '😵 Auto-Mod: Emoji Spam',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Emojis:** ${emojis.length} (limit: ${emojiLimit})\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Emoji spam filter error:', error);
        }
    }
    return false;
}

/**
 * Check for duplicate messages
 */
async function checkDuplicates(message, guildSettings) {
    if (guildSettings?.anti_duplicate === 0) return false;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const userMessages = duplicateCache.get(key) || [];

    // Clean old messages (older than 30 seconds)
    const recentMessages = userMessages.filter(m => now - m.time < 30000);

    // Check if this message is a duplicate
    const isDuplicate = recentMessages.some(m =>
        m.content.toLowerCase() === message.content.toLowerCase() &&
        message.content.length > 10
    );

    // Add current message
    recentMessages.push({ content: message.content, time: now });
    duplicateCache.set(key, recentMessages.slice(-10)); // Keep last 10

    if (isDuplicate) {
        try {
            await message.delete();

            const result = await applyPunishment(message, 'duplicate', 'Repeating the same message');

            const notifyMsg = await message.channel.send({
                embeds: [warningEmbed(
                    '🔁 Duplicate Message',
                    `${message.author}, please don't repeat yourself!\n` +
                    `**Violation #${result?.violationCount || 1}**`
                )]
            });
            setTimeout(() => notifyMsg.delete().catch(() => { }), 5000);

            const log = logEmbed(
                '🔁 Auto-Mod: Duplicate',
                `**User:** ${message.author.tag} (${message.author.id})\n` +
                `**Channel:** ${message.channel}\n` +
                `**Action:** ${result?.punishment?.action || 'delete'}`,
                settings.warningColor
            );
            await sendLog(message.guild, log);

            return true;
        } catch (error) {
            console.error('Duplicate filter error:', error);
        }
    }
    return false;
}

/**
 * Anti-Raid: Track member joins (call this from guildMemberAdd event)
 */
async function trackJoin(member) {
    if (!settings.automod.antiRaid.enabled) return;

    const key = member.guild.id;
    const now = Date.now();
    const joins = joinCache.get(key) || [];

    // Clean old joins
    const recentJoins = joins.filter(j => now - j < settings.automod.antiRaid.interval);
    recentJoins.push(now);
    joinCache.set(key, recentJoins);

    if (recentJoins.length >= settings.automod.antiRaid.maxJoins) {
        // Raid detected! Enable lockdown
        try {
            const guild = member.guild;

            // Find a mod/log channel to notify
            const modChannel = guild.channels.cache.find(
                c => c.name.includes('mod') || c.name.includes('log') || c.name === 'general'
            );

            if (modChannel) {
                await modChannel.send({
                    embeds: [errorEmbed(
                        '🚨 RAID DETECTED',
                        `**${recentJoins.length} members** joined in the last ${settings.automod.antiRaid.interval / 1000} seconds!\n\n` +
                        `⚠️ Consider enabling verification or locking the server.`
                    )]
                });
            }

            // Log the raid
            const log = logEmbed(
                '🚨 Auto-Mod: Raid Alert',
                `**Joins:** ${recentJoins.length} in ${settings.automod.antiRaid.interval / 1000}s\n` +
                `**Threshold:** ${settings.automod.antiRaid.maxJoins}`,
                settings.errorColor
            );
            await sendLog(guild, log);

            // Clear the cache
            joinCache.delete(key);

        } catch (error) {
            console.error('Anti-raid error:', error);
        }
    }
}

// Export the trackJoin function for use in guildMemberAdd event
module.exports.trackJoin = trackJoin;
