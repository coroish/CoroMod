const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logModAction } = require('../../utils/logger');
const { logModAction: dbLogModAction } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    cooldown: 5,

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;

        // Get the member object
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        // Check if user exists in guild
        if (!member) {
            // User not in guild, can still ban by ID
            try {
                await interaction.guild.members.ban(target.id, {
                    deleteMessageDays: deleteDays,
                    reason: `${reason} | Banned by ${interaction.user.tag}`
                });

                // Log to database
                dbLogModAction(interaction.guild.id, 'BAN', target.id, interaction.user.id, reason);

                // Log to channel
                await logModAction(interaction.guild, 'User Banned', interaction.user, target, reason);

                return interaction.reply({
                    embeds: [successEmbed('User Banned', `**${target.tag}** has been banned.\n**Reason:** ${reason}`)]
                });
            } catch (error) {
                return interaction.reply({
                    embeds: [errorEmbed('Ban Failed', 'Could not ban this user. They may have already been banned.')],
                    ephemeral: true
                });
            }
        }

        // Check role hierarchy
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                embeds: [errorEmbed('Permission Denied', 'You cannot ban someone with equal or higher roles than you.')],
                ephemeral: true
            });
        }

        // Check if bot can ban the user
        if (!member.bannable) {
            return interaction.reply({
                embeds: [errorEmbed('Cannot Ban', 'I cannot ban this user. They may have higher permissions than me.')],
                ephemeral: true
            });
        }

        try {
            // Try to DM the user before banning
            await target.send({
                embeds: [errorEmbed(
                    `Banned from ${interaction.guild.name}`,
                    `You have been banned.\n**Reason:** ${reason}`
                )]
            }).catch(() => { }); // Ignore if DM fails

            // Ban the user
            await member.ban({
                deleteMessageSeconds: deleteDays * 24 * 60 * 60,
                reason: `${reason} | Banned by ${interaction.user.tag}`
            });

            // Log to database
            dbLogModAction(interaction.guild.id, 'BAN', target.id, interaction.user.id, reason);

            // Log to channel
            await logModAction(interaction.guild, 'User Banned', interaction.user, target, reason);

            return interaction.reply({
                embeds: [successEmbed('User Banned', `**${target.tag}** has been banned.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Ban error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Ban Failed', 'An error occurred while trying to ban this user.')],
                ephemeral: true
            });
        }
    }
};
