const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../utils/embedBuilder');
const { logModAction } = require('../utils/logger');
const { addWarning, getWarnings } = require('../utils/database');

module.exports = {
    name: 'warn',
    aliases: ['w'],
    description: 'Warn a user - Usage: c!warn @user [reason]',
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
                embeds: [errorEmbed('Invalid Usage', 'Please mention a user to warn.\n**Usage:** `c!warn @user [reason]`')]
            });
        }

        // Get the member object
        const member = await message.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return message.reply({
                embeds: [errorEmbed('User Not Found', 'This user is not in the server.')]
            });
        }

        // Can't warn bots
        if (target.bot) {
            return message.reply({
                embeds: [errorEmbed('Invalid Target', 'You cannot warn a bot.')]
            });
        }

        // Check role hierarchy
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                embeds: [errorEmbed('Permission Denied', 'You cannot warn someone with equal or higher roles than you.')]
            });
        }

        // Get reason
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            // Add warning to database
            addWarning(message.guild.id, target.id, message.author.id, reason);

            // Get updated warning count
            const warnings = getWarnings(message.guild.id, target.id);
            const warningCount = warnings.length;

            // Try to DM the user
            await target.send({
                embeds: [warningEmbed(
                    `Warning in ${message.guild.name}`,
                    `You have received a warning.\n**Reason:** ${reason}\n\n⚠️ You now have **${warningCount}** warning(s).`
                )]
            }).catch(() => { });

            // Log to channel
            await logModAction(message.guild, 'User Warned', message.author, target, reason);

            // Delete the command message and send confirmation
            await message.delete().catch(() => { });
            return message.channel.send({
                embeds: [successEmbed('User Warned', `**${target.tag}** has been warned.\n**Reason:** ${reason}\n\n📊 This user now has **${warningCount}** warning(s).`)]
            });

        } catch (error) {
            console.error('Warn error:', error);
            return message.reply({
                embeds: [errorEmbed('Warning Failed', 'An error occurred while trying to warn this user.')]
            });
        }
    }
};
