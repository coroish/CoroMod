const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/embedBuilder');
const { logModAction } = require('../utils/logger');
const { logModAction: dbLogModAction } = require('../utils/database');

module.exports = {
    name: 'ban',
    aliases: ['b'],
    description: 'Ban a user - Usage: c!b @user [reason]',
    permissions: [PermissionFlagsBits.BanMembers],

    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({
                embeds: [errorEmbed('Permission Denied', 'You need the `Ban Members` permission to use this command.')]
            });
        }

        // Get target user
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply({
                embeds: [errorEmbed('Invalid Usage', 'Please mention a user to ban.\n**Usage:** `c!b @user [reason]`')]
            });
        }

        // Get reason
        const reason = args.slice(1).join(' ') || 'No reason provided';

        // Get the member object
        const member = await message.guild.members.fetch(target.id).catch(() => null);

        // If member not in guild, still try to ban
        if (!member) {
            try {
                await message.guild.members.ban(target.id, {
                    deleteMessageDays: 0,
                    reason: `${reason} | Banned by ${message.author.tag}`
                });

                // Log to database
                dbLogModAction(message.guild.id, 'BAN', target.id, message.author.id, reason);

                // Log to channel
                await logModAction(message.guild, 'User Banned', message.author, target, reason);

                await message.delete().catch(() => { });
                return message.channel.send({
                    embeds: [successEmbed('User Banned', `**${target.tag}** has been banned.\n**Reason:** ${reason}`)]
                });
            } catch (error) {
                return message.reply({
                    embeds: [errorEmbed('Ban Failed', 'Could not ban this user. They may have already been banned.')]
                });
            }
        }

        // Check role hierarchy
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                embeds: [errorEmbed('Permission Denied', 'You cannot ban someone with equal or higher roles than you.')]
            });
        }

        // Check if bot can ban the user
        if (!member.bannable) {
            return message.reply({
                embeds: [errorEmbed('Cannot Ban', 'I cannot ban this user. They may have higher permissions than me.')]
            });
        }

        try {
            // Try to DM the user before banning
            await target.send({
                embeds: [errorEmbed(
                    `Banned from ${message.guild.name}`,
                    `You have been banned.\n**Reason:** ${reason}`
                )]
            }).catch(() => { });

            // Ban the user
            await member.ban({
                deleteMessageSeconds: 0,
                reason: `${reason} | Banned by ${message.author.tag}`
            });

            // Log to database
            dbLogModAction(message.guild.id, 'BAN', target.id, message.author.id, reason);

            // Log to channel
            await logModAction(message.guild, 'User Banned', message.author, target, reason);

            // Delete the command message and send confirmation
            await message.delete().catch(() => { });
            return message.channel.send({
                embeds: [successEmbed('User Banned', `**${target.tag}** has been banned.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Ban error:', error);
            return message.reply({
                embeds: [errorEmbed('Ban Failed', 'An error occurred while trying to ban this user.')]
            });
        }
    }
};
