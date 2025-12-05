const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/embedBuilder');
const { logModAction } = require('../utils/logger');
const { logModAction: dbLogModAction } = require('../utils/database');

module.exports = {
    name: 'mute',
    aliases: ['m'],
    description: 'Mute a user - Usage: c!m @user [duration in minutes] [reason]',
    permissions: [PermissionFlagsBits.ModerateMembers],

    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
                embeds: [errorEmbed('Permission Denied', 'You need the `Moderate Members` permission to use this command.')]
            });
        }

        // Get target user
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply({
                embeds: [errorEmbed('Invalid Usage', 'Please mention a user to mute.\n**Usage:** `c!m @user [duration] [reason]`')]
            });
        }

        // Get duration (default 10 minutes)
        const duration = parseInt(args[1]) || 10;
        if (duration < 1 || duration > 40320) {
            return message.reply({
                embeds: [errorEmbed('Invalid Duration', 'Duration must be between 1 and 40320 minutes (28 days).')]
            });
        }

        // Get reason
        const reason = args.slice(2).join(' ') || 'No reason provided';

        // Get the member object
        const member = await message.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return message.reply({
                embeds: [errorEmbed('User Not Found', 'This user is not in the server.')]
            });
        }

        // Check role hierarchy
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                embeds: [errorEmbed('Permission Denied', 'You cannot mute someone with equal or higher roles than you.')]
            });
        }

        // Check if bot can timeout the user
        if (!member.moderatable) {
            return message.reply({
                embeds: [errorEmbed('Cannot Mute', 'I cannot mute this user. They may have higher permissions than me.')]
            });
        }

        try {
            const durationMs = duration * 60 * 1000;
            const durationString = formatDuration(duration);

            // Timeout the user
            await member.timeout(durationMs, `${reason} | Muted by ${message.author.tag}`);

            // Try to DM the user
            await target.send({
                embeds: [errorEmbed(
                    `Muted in ${message.guild.name}`,
                    `You have been muted for **${durationString}**.\n**Reason:** ${reason}`
                )]
            }).catch(() => { });

            // Log to database
            dbLogModAction(message.guild.id, 'MUTE', target.id, message.author.id, reason, duration);

            // Log to channel
            await logModAction(message.guild, 'User Muted', message.author, target, reason, durationString);

            // Delete the command message and send confirmation
            await message.delete().catch(() => { });
            return message.channel.send({
                embeds: [successEmbed('User Muted', `**${target.tag}** has been muted for **${durationString}**.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Mute error:', error);
            return message.reply({
                embeds: [errorEmbed('Mute Failed', 'An error occurred while trying to mute this user.')]
            });
        }
    }
};

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(minutes / 1440);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
}
