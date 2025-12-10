const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logModAction } = require('../../utils/logger');
const { logModAction: dbLogModAction } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a user (prevent them from sending messages)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the mute in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) // Max 28 days
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    cooldown: 5,

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
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
                embeds: [errorEmbed('Permission Denied', 'You cannot mute someone with equal or higher roles than you.')],
                ephemeral: true
            });
        }

        // Check if bot can timeout the user
        if (!member.moderatable) {
            return interaction.reply({
                embeds: [errorEmbed('Cannot Mute', 'I cannot mute this user. They may have higher permissions than me.')],
                ephemeral: true
            });
        }

        try {
            const durationMs = duration * 60 * 1000; // Convert minutes to milliseconds
            const durationString = formatDuration(duration);

            // Timeout the user
            await member.timeout(durationMs, `${reason} | Muted by ${interaction.user.tag}`);

            // Try to DM the user
            await target.send({
                embeds: [errorEmbed(
                    `Muted in ${interaction.guild.name}`,
                    `You have been muted for **${durationString}**.\n**Reason:** ${reason}`
                )]
            }).catch(() => { });

            // Log to database
            dbLogModAction(interaction.guild.id, 'MUTE', target.id, interaction.user.id, reason, duration);

            // Log to channel
            await logModAction(interaction.guild, 'User Muted', interaction.user, target, reason, durationString);

            return interaction.reply({
                embeds: [successEmbed('User Muted', `**${target.tag}** has been muted for **${durationString}**.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Mute error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Mute Failed', 'An error occurred while trying to mute this user.')],
                ephemeral: true
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
