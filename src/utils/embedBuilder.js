const { EmbedBuilder } = require('discord.js');
const settings = require('../config/settings');

/**
 * Create a success embed
 */
function successEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(settings.successColor)
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create an error embed
 */
function errorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(settings.errorColor)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a warning embed
 */
function warningEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(settings.warningColor)
        .setTitle(`⚠️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create an info embed
 */
function infoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(settings.embedColor)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a moderation action embed
 */
function modActionEmbed(action, moderator, target, reason, duration = null) {
    const embed = new EmbedBuilder()
        .setColor(settings.errorColor)
        .setTitle(`🔨 ${action}`)
        .addFields(
            { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
            { name: '👮 Moderator', value: `${moderator.tag}`, inline: true },
            { name: '📝 Reason', value: reason || 'No reason provided', inline: false }
        )
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    if (duration) {
        embed.addFields({ name: '⏱️ Duration', value: duration, inline: true });
    }

    return embed;
}

/**
 * Create a log embed
 */
function logEmbed(title, description, color = settings.embedColor) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

module.exports = {
    successEmbed,
    errorEmbed,
    warningEmbed,
    infoEmbed,
    modActionEmbed,
    logEmbed
};
