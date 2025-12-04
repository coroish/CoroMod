const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logModAction } = require('../../utils/logger');
const { logModAction: dbLogModAction } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    cooldown: 5,

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Get the member object
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [errorEmbed('User Not Found', 'This user is not in the server.')],
                ephemeral: true
            });
        }

        // Check role hierarchy
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                embeds: [errorEmbed('Permission Denied', 'You cannot kick someone with equal or higher roles than you.')],
                ephemeral: true
            });
        }

        // Check if bot can kick the user
        if (!member.kickable) {
            return interaction.reply({
                embeds: [errorEmbed('Cannot Kick', 'I cannot kick this user. They may have higher permissions than me.')],
                ephemeral: true
            });
        }

        try {
            // Try to DM the user before kicking
            await target.send({
                embeds: [errorEmbed(
                    `Kicked from ${interaction.guild.name}`,
                    `You have been kicked.\n**Reason:** ${reason}`
                )]
            }).catch(() => { }); // Ignore if DM fails

            // Kick the user
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

            // Log to database
            dbLogModAction(interaction.guild.id, 'KICK', target.id, interaction.user.id, reason);

            // Log to channel
            await logModAction(interaction.guild, 'User Kicked', interaction.user, target, reason);

            return interaction.reply({
                embeds: [successEmbed('User Kicked', `**${target.tag}** has been kicked.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Kick error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Kick Failed', 'An error occurred while trying to kick this user.')],
                ephemeral: true
            });
        }
    }
};
