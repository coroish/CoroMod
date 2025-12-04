const { getGuildSettings } = require('./database');
const { logEmbed } = require('./embedBuilder');
const settings = require('../config/settings');

/**
 * Send a log message to the guild's log channel
 */
async function sendLog(guild, embed) {
    try {
        const guildSettings = getGuildSettings(guild.id);
        let logChannel = null;

        // Try to find log channel from settings
        if (guildSettings?.log_channel_id) {
            logChannel = guild.channels.cache.get(guildSettings.log_channel_id);
        }

        // Fallback: find channel by name
        if (!logChannel) {
            logChannel = guild.channels.cache.find(
                ch => ch.name === settings.logging.logChannelName && ch.isTextBased()
            );
        }

        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error sending log:', error);
        return false;
    }
}

/**
 * Log a moderation action
 */
async function logModAction(guild, action, moderator, target, reason, duration = null) {
    const { modActionEmbed } = require('./embedBuilder');
    const embed = modActionEmbed(action, moderator, target, reason, duration);
    embed.setFooter({ text: `User ID: ${target.id}` });
    return sendLog(guild, embed);
}

/**
 * Log a member join event
 */
async function logMemberJoin(member) {
    if (!settings.logging.events.memberJoin) return;

    const embed = logEmbed(
        '📥 Member Joined',
        `**${member.user.tag}** joined the server\n` +
        `📅 Account created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
        `👥 Member count: ${member.guild.memberCount}`,
        settings.successColor
    );
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
    embed.setFooter({ text: `User ID: ${member.id}` });

    return sendLog(member.guild, embed);
}

/**
 * Log a member leave event
 */
async function logMemberLeave(member) {
    if (!settings.logging.events.memberLeave) return;

    const roles = member.roles.cache
        .filter(r => r.id !== member.guild.id)
        .map(r => r.toString())
        .join(', ') || 'None';

    const embed = logEmbed(
        '📤 Member Left',
        `**${member.user.tag}** left the server\n` +
        `📅 Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n` +
        `🎭 Roles: ${roles}\n` +
        `👥 Member count: ${member.guild.memberCount}`,
        settings.errorColor
    );
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
    embed.setFooter({ text: `User ID: ${member.id}` });

    return sendLog(member.guild, embed);
}

/**
 * Log a message delete event
 */
async function logMessageDelete(message) {
    if (!settings.logging.events.messageDelete) return;
    if (message.author?.bot) return;

    const embed = logEmbed(
        '🗑️ Message Deleted',
        `**Author:** ${message.author?.tag || 'Unknown'}\n` +
        `**Channel:** ${message.channel}\n` +
        `**Content:**\n${message.content?.slice(0, 1000) || '*No content (possibly an embed or attachment)*'}`,
        settings.warningColor
    );
    embed.setFooter({ text: `Message ID: ${message.id}` });

    return sendLog(message.guild, embed);
}

/**
 * Log a message edit event
 */
async function logMessageEdit(oldMessage, newMessage) {
    if (!settings.logging.events.messageEdit) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const embed = logEmbed(
        '✏️ Message Edited',
        `**Author:** ${newMessage.author.tag}\n` +
        `**Channel:** ${newMessage.channel}\n` +
        `[Jump to Message](${newMessage.url})\n\n` +
        `**Before:**\n${oldMessage.content?.slice(0, 500) || '*No content*'}\n\n` +
        `**After:**\n${newMessage.content?.slice(0, 500) || '*No content*'}`,
        settings.embedColor
    );
    embed.setFooter({ text: `Message ID: ${newMessage.id}` });

    return sendLog(newMessage.guild, embed);
}

module.exports = {
    sendLog,
    logModAction,
    logMemberJoin,
    logMemberLeave,
    logMessageDelete,
    logMessageEdit
};
